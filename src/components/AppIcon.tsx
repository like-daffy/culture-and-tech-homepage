import Image from "next/image";
import type { AppInfo } from "@/lib/apps";
import { cn } from "@/lib/utils";

interface AppIconProps {
  app: AppInfo;
  /** Edge of the square, in CSS pixels */
  size: number;
  priority?: boolean;
  className?: string;
}

/**
 * The app's icon. An app without one gets its fallback symbol on a tile with a macOS icon's proportions
 * (the body is 80 % of the square), so both kinds line up side by side.
 */
export function AppIcon({ app, size, priority, className }: AppIconProps) {
  if (app.icon) {
    return (
      <Image
        src={app.icon}
        alt=""
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0", className)}
      />
    );
  }

  const Icon = app.fallbackIcon;
  return (
    <div
      aria-hidden="true"
      className={cn("shrink-0 flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="flex items-center justify-center bg-primary text-primary-foreground shadow-sm"
        style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.18 }}
      >
        <Icon style={{ width: size * 0.4, height: size * 0.4 }} strokeWidth={1.75} />
      </div>
    </div>
  );
}
