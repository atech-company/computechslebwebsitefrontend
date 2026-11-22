import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block h-14 w-40 shrink-0 overflow-hidden",
        className,
      )}
    >
      <Image
        src="/computechs-logo.png"
        alt="Computechs Technology"
        width={612}
        height={408}
        priority={priority}
        className="absolute left-1/2 top-1/2 h-auto w-[153%] max-w-none -translate-x-1/2 -translate-y-1/2"
        sizes="(max-width: 640px) 144px, 176px"
      />
    </span>
  );
}
