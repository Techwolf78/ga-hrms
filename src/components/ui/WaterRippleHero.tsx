import React, { useEffect, useRef, useState } from "react";

interface WaterRippleHeroProps {
  src: string;
  alt: string;
  className?: string;
}

// Normalized (0..1, top-down) polygon tracing the reflecting pool in /brand/hero-bg.jpg
const WATER_POLYGON: [number, number][] = [
  [0.135, 0.746],
  [0.573, 0.654],
  [0.995, 0.677],
  [0.995, 0.895],
  [0.885, 1.0],
  [0.495, 1.0],
];

const MAX_RIPPLES = 24;
const RIPPLE_MAX_AGE = 1.6;
const RIPPLE_SPEED = 0.14;
const RIPPLE_DECAY = 2.4;

function isPointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-7) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function getCoverTransform(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number
) {
  const containerAspect = containerW / Math.max(1, containerH);
  const imageAspect = imageW / Math.max(1, imageH);

  let scaleX = 1;
  let scaleY = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (containerAspect > imageAspect) {
    scaleY = imageAspect / containerAspect;
    offsetY = (1 - scaleY) * 0.5;
  } else {
    scaleX = containerAspect / imageAspect;
    offsetX = (1 - scaleX) * 0.5;
  }

  return { scaleX, scaleY, offsetX, offsetY };
}

// Pre-bake the water mask polygon once into a hardware-sampled texture
function createWaterMaskCanvas(width = 512, height = 288): HTMLCanvasElement {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return maskCanvas;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.filter = "blur(2px)";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  WATER_POLYGON.forEach(([px, py], idx) => {
    const x = px * width;
    const y = py * height;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return maskCanvas;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vScreenUv;
void main() {
  vScreenUv = aPosition * 0.5 + 0.5;
  vScreenUv.y = 1.0 - vScreenUv.y;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;
uniform float uTime;
uniform vec4 uCover;       // xy = offset, zw = scale
uniform vec2 uAspectInfo;  // x = aspect, y = invAspect
uniform vec4 uRipples[${MAX_RIPPLES}]; // xy = imageUv, z = precomputed radius, w = precomputed amplitude

varying vec2 vScreenUv;

void main() {
  vec2 imgUv = uCover.xy + vScreenUv * uCover.zw;

  // Single texture lookup instead of per-pixel polygon math
  float mask = texture2D(uMaskTexture, imgUv).r;

  vec2 disp = vec2(0.0);
  float specular = 0.0;

  if (mask > 0.005) {
    float perspectiveFactor = 3.4 + max(0.0, 0.9 - imgUv.y) * 3.0;

    // Subtle high-precision ambient water shimmer
    float breeze = sin(imgUv.x * uAspectInfo.x * 68.0 + uTime * 1.4)
                 * cos(imgUv.y * perspectiveFactor * 68.0 - uTime * 1.1);
    disp += vec2(breeze * 0.0003, breeze * 0.00065);

    // Interactive cursor ripples using CPU-precomputed radius & decayed amplitude
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      if (r.w > 0.001) {
        float rippleDepthScale = 3.4 + max(0.0, 0.9 - r.y) * 3.0;
        vec2 delta = imgUv - r.xy;
        delta.x *= uAspectInfo.x;

        vec2 pDelta = vec2(delta.x, delta.y * rippleDepthScale);
        float dist = length(pDelta);
        float diff = dist - r.z;

        // Early band skip (~90% of pixels outside active ring avoid sin/exp)
        if (abs(diff) < 0.075) {
          float band = exp(-(diff * diff) * 2304.0);
          float wave = sin(diff * 165.0) * band * r.w;

          vec2 pDir = dist > 0.0001 ? pDelta / dist : vec2(0.0);
          vec2 imgDir = vec2(pDir.x * uAspectInfo.y, pDir.y * rippleDepthScale);

          disp += imgDir * wave * 0.0072;
          specular += max(0.0, wave) * 0.22;
        }
      }
    }
  }

  vec2 finalUv = clamp(imgUv + disp * mask, 0.001, 0.999);
  vec4 color = texture2D(uTexture, finalUv);
  color.rgb += vec3(0.85, 0.95, 1.0) * specular * mask;

  gl_FragColor = color;
}
`;

export function WaterRippleHero({ src, alt, className }: WaterRippleHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglReady, setWebglReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );

  // Raw ripple ring buffer (x, y, startTime, strength) + precomputed GPU upload buffer
  const rawRipplesRef = useRef<Float32Array>(new Float32Array(MAX_RIPPLES * 4));
  const gpuRipplesRef = useRef<Float32Array>(new Float32Array(MAX_RIPPLES * 4));
  const rippleIndexRef = useRef(0);
  const startTimeRef = useRef<number>(performance.now() / 1000);
  const lastSpawnRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const imageSizeRef = useRef<{ w: number; h: number }>({ w: 1376, h: 768 });
  const coverRef = useRef<{ scaleX: number; scaleY: number; offsetX: number; offsetY: number }>({
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setIsDesktop(mq.matches);
      if (!mq.matches) setWebglReady(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Image texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Pre-baked water mask texture
    const maskTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      createWaterMaskCanvas(512, 288)
    );

    const uTexture = gl.getUniformLocation(program, "uTexture");
    const uMaskTexture = gl.getUniformLocation(program, "uMaskTexture");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uCover = gl.getUniformLocation(program, "uCover");
    const uAspectInfo = gl.getUniformLocation(program, "uAspectInfo");
    const uRipples = gl.getUniformLocation(program, "uRipples");

    gl.uniform1i(uTexture, 0);
    gl.uniform1i(uMaskTexture, 1);

    let rafId = 0;
    let isDisposed = false;

    const updateLayoutUniforms = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);

      const cover = getCoverTransform(
        rect.width,
        rect.height,
        imageSizeRef.current.w,
        imageSizeRef.current.h
      );
      coverRef.current = cover;
      const aspect = imageSizeRef.current.w / Math.max(1, imageSizeRef.current.h);
      gl.uniform4f(uCover, cover.offsetX, cover.offsetY, cover.scaleX, cover.scaleY);
      gl.uniform2f(uAspectInfo, aspect, 1 / Math.max(0.5, aspect));
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (isDisposed) return;
      imageSizeRef.current = { w: img.naturalWidth || 1376, h: img.naturalHeight || 768 };
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      updateLayoutUniforms();
      setWebglReady(true);

      const render = () => {
        if (isDisposed) return;
        const now = performance.now() / 1000 - startTimeRef.current;

        // Precompute ripple radius & exponential decay once per ripple on CPU
        const raw = rawRipplesRef.current;
        const gpu = gpuRipplesRef.current;
        for (let i = 0; i < MAX_RIPPLES; i++) {
          const base = i * 4;
          const strength = raw[base + 3];
          const age = now - raw[base + 2];
          if (strength > 0 && age >= 0 && age < RIPPLE_MAX_AGE) {
            gpu[base] = raw[base];
            gpu[base + 1] = raw[base + 1];
            gpu[base + 2] = age * RIPPLE_SPEED;
            gpu[base + 3] = Math.exp(-age * RIPPLE_DECAY) * strength;
          } else {
            gpu[base + 3] = 0;
          }
        }

        gl.uniform1f(uTime, now);
        gl.uniform4fv(uRipples, gpu);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", updateLayoutUniforms);
    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateLayoutUniforms);
    };
  }, [src, isDesktop]);

  const spawnRippleAtPointer = (clientX: number, clientY: number, strength = 0.95) => {
    if (!isDesktop || !webglReady) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const screenX = (clientX - rect.left) / Math.max(1, rect.width);
    const screenY = (clientY - rect.top) / Math.max(1, rect.height);

    const { scaleX, scaleY, offsetX, offsetY } = coverRef.current;
    const imgX = offsetX + screenX * scaleX;
    const imgY = offsetY + screenY * scaleY;

    // Only spawn ripples when cursor is inside the reflecting pool mask
    if (!isPointInPolygon(imgX, imgY, WATER_POLYGON)) return;

    const nowMs = performance.now();
    if (strength < 1.1 && nowMs - lastSpawnRef.current < 28) return;

    if (lastPosRef.current && strength < 1.1) {
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      if (dx * dx + dy * dy < 16) return;
    }

    lastSpawnRef.current = nowMs;
    lastPosRef.current = { x: clientX, y: clientY };

    const idx = rippleIndexRef.current % MAX_RIPPLES;
    rippleIndexRef.current += 1;

    const nowSec = nowMs / 1000 - startTimeRef.current;
    const base = idx * 4;
    rawRipplesRef.current[base] = imgX;
    rawRipplesRef.current[base + 1] = imgY;
    rawRipplesRef.current[base + 2] = nowSec;
    rawRipplesRef.current[base + 3] = strength;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={(e) => spawnRippleAtPointer(e.clientX, e.clientY, 0.95)}
      onPointerDown={(e) => spawnRippleAtPointer(e.clientX, e.clientY, 1.45)}
      className={className}
    >
      {/* Fallback / initial crisp image while WebGL initializes */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isDesktop && webglReady ? "md:opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      {isDesktop && (
        <canvas
          ref={canvasRef}
          className={`hidden md:block absolute inset-0 w-full h-full transition-opacity duration-300 ${
            webglReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
