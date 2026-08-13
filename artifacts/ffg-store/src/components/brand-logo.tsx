import grich20Logo from "@assets/IMG_1201_JPG_1780421888804.webp";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Outer frame size classes — must stay fixed (e.g. h-9 w-9). */
  frameClassName: string;
  /** Extra zoom so artwork fills the frame (logo assets have large margins). */
  scaleClassName?: string;
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
  width?: number;
  height?: number;
};

/**
 * Fixed-size logo frame with overflow crop + scale so the mark is visible
 * without changing the container dimensions.
 */
export function BrandLogo({
  frameClassName,
  scaleClassName = "scale-150",
  className,
  alt = "GRICH20",
  loading = "lazy",
  width = 96,
  height = 96,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex overflow-hidden rounded-lg ring-1 ring-primary/30 shrink-0",
        frameClassName,
        className,
      )}
    >
      <img
        src={grich20Logo}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={cn("h-full w-full object-cover", scaleClassName)}
      />
    </span>
  );
}
