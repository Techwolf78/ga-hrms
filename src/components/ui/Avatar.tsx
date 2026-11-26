import React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  status?: "online" | "offline" | "busy" | "away";
}

export function Avatar({ src, name = "", size = "md", className, status }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-14 h-14 text-lg font-semibold",
    xl: "w-20 h-20 text-2xl font-bold",
  };

  const statusSizeMap = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
  };

  const statusColorMap = {
    online: "bg-[#188038]",
    offline: "bg-[#697586]",
    busy: "bg-[#C62828]",
    away: "bg-[#E69F00]",
  };

  const getInitials = (str: string) => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  // Generate consistent pleasant background gradient based on name
  const getGradient = (str: string) => {
    const gradients = [
      "from-[#1F8476] to-[#166C61]",
      "from-[#4B5D6B] to-[#293E40]",
      "from-[#032D42] to-[#1F8476]",
      "from-[#166C61] to-[#032D42]",
      "from-[#4B5D6B] to-[#1F8476]",
      "from-[#80B6A1] to-[#166C61]",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center overflow-hidden border border-white/50 shadow-sm",
          sizeMap[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center bg-gradient-to-tr text-white tracking-wider",
              getGradient(name)
            )}
          >
            {getInitials(name)}
          </div>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            statusSizeMap[size],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
}
