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
    // Container is wider than image: crop top/bottom
    scaleY = imageAspect / containerAspect;
    offsetY = (1 - scaleY) * 0.5;
  } else {
    // Container is taller than image: crop left/right
    scaleX = containerAspect / imageAspect;
    offsetX = (1 - scaleX) * 0.5;
  }

  return { scaleX, scaleY, offsetX, offsetY };
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
uniform float uTime;
uniform vec2 uImageOffset;
uniform vec2 uImageScale;
uniform float uAspect;
uniform vec4 uRipples[${MAX_RIPPLES}]; // xy = imageUv, z = startTime, w = strength

varying vec2 vScreenUv;

// Signed distance helper to test if a point is inside our 6-vertex pool polygon
float edgeDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float waterMask(vec2 p) {
  vec2 p0 = vec2(0.135, 0.746);
  vec2 p1 = vec2(0.573, 0.654);
  vec2 p2 = vec2(0.995, 0.677);
  vec2 p3 = vec2(0.995, 0.895);
  vec2 p4 = vec2(0.885, 1.000);
  vec2 p5 = vec2(0.495, 1.000);

  // Winding / half-plane checks for each edge (clockwise in top-down UV)
  bool inside = true;
  vec2 pts[6];
  pts[0] = p0; pts[1] = p1; pts[2] = p2; pts[3] = p3; pts[4] = p4; pts[5] = p5;

  float minDist = 10.0;
  int crossings = 0;
  for (int i = 0; i < 6; i++) {
    vec2 a = pts[i];
    vec2 b = (i == 5) ? pts[0] : pts[i + 1];
    minDist = min(minDist, edgeDist(p, a, b));
    if (((a.y > p.y) != (b.y > p.y)) &&
        (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y + 0.000001) + a.x)) {
      crossings++;
    }
  }
  inside = (mod(float(crossings), 2.0) > 0.5);
  float signedDist = inside ? minDist : -minDist;
  return smoothstep(-0.004, 0.008, signedDist);
}

void main() {
  vec2 imgUv = uImageOffset + vScreenUv * uImageScale;
  float mask = waterMask(imgUv);

  vec2 disp = vec2(0.0);
  float specular = 0.0;

  if (mask > 0.001) {
    // Subtle ambient water shimmer
    float breeze = sin(imgUv.x * 55.0 + uTime * 1.4) * cos(imgUv.y * 80.0 - uTime * 1.1);
    disp += vec2(breeze * 0.0006, breeze * 0.0009);

    // Interactive cursor ripples
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w > 0.0 && age >= 0.0 && age < 2.6) {
        vec2 delta = imgUv - r.xy;
        delta.x *= uAspect;
        float dist = length(delta);
        float radius = age * 0.24;
        float band = exp(-pow((dist - radius) * 26.0, 2.0));
        float decay = exp(-age * 1.55) * r.w;
        float wave = sin((dist - radius) * 95.0) * band * decay;
        vec2 dir = dist > 0.0001 ? normalize(delta) : vec2(0.0);
        disp += dir * wave * 0.012;
        specular += max(0.0, wave) * 0.16;
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

  // Ripple ring buffer & cover transform refs for pointer hit-testing
  const ripplesRef = useRef<Float32Array>(new Float32Array(MAX_RIPPLES * 4));
  const rippleIndexRef = useRef(0);
  const startTimeRef = useRef<number>(performance.now() / 1000);
  const lastSpawnRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const imageSizeRef = useRef<{ w: number; h: number }>({ w: 1376, h: 768 });

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

    // Texture setup
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let rafId = 0;
    let isDisposed = false;

    const uTime = gl.getUniformLocation(program, "uTime");
    const uImageOffset = gl.getUniformLocation(program, "uImageOffset");
    const uImageScale = gl.getUniformLocation(program, "uImageScale");
    const uAspect = gl.getUniformLocation(program, "uAspect");
    const uRipples = gl.getUniformLocation(program, "uRipples");

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (isDisposed) return;
      imageSizeRef.current = { w: img.naturalWidth || 1376, h: img.naturalHeight || 768 };
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      resize();
      setWebglReady(true);

      const render = () => {
        if (isDisposed) return;
        const now = performance.now() / 1000 - startTimeRef.current;
        const rect = container.getBoundingClientRect();
        const { scaleX, scaleY, offsetX, offsetY } = getCoverTransform(
          rect.width,
          rect.height,
          imageSizeRef.current.w,
          imageSizeRef.current.h
        );

        gl.uniform1f(uTime, now);
        gl.uniform2f(uImageOffset, offsetX, offsetY);
        gl.uniform2f(uImageScale, scaleX, scaleY);
        gl.uniform1f(uAspect, imageSizeRef.current.w / Math.max(1, imageSizeRef.current.h));
        gl.uniform4fv(uRipples, ripplesRef.current);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [src, isDesktop]);

  const spawnRippleAtPointer = (clientX: number, clientY: number, strength = 0.85) => {
    if (!isDesktop || !webglReady) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const screenX = (clientX - rect.left) / Math.max(1, rect.width);
    const screenY = (clientY - rect.top) / Math.max(1, rect.height);

    const { scaleX, scaleY, offsetX, offsetY } = getCoverTransform(
      rect.width,
      rect.height,
      imageSizeRef.current.w,
      imageSizeRef.current.h
    );

    const imgX = offsetX + screenX * scaleX;
    const imgY = offsetY + screenY * scaleY;

    // Only spawn ripples when cursor is inside the reflecting pool mask!
    if (!isPointInPolygon(imgX, imgY, WATER_POLYGON)) return;

    const nowMs = performance.now();
    if (strength < 1.0 && nowMs - lastSpawnRef.current < 45) return;

    if (lastPosRef.current && strength < 1.0) {
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      if (dx * dx + dy * dy < 36) return;
    }

    lastSpawnRef.current = nowMs;
    lastPosRef.current = { x: clientX, y: clientY };

    const idx = rippleIndexRef.current % MAX_RIPPLES;
    rippleIndexRef.current += 1;

    const nowSec = nowMs / 1000 - startTimeRef.current;
    const base = idx * 4;
    ripplesRef.current[base] = imgX;
    ripplesRef.current[base + 1] = imgY;
    ripplesRef.current[base + 2] = nowSec;
    ripplesRef.current[base + 3] = strength;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={(e) => spawnRippleAtPointer(e.clientX, e.clientY, 0.75)}
      onPointerDown={(e) => spawnRippleAtPointer(e.clientX, e.clientY, 1.25)}
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

