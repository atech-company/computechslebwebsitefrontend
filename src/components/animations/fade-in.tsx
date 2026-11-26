import { cn } from "@/lib/utils";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
  style,
  ...props
}: FadeInProps) {
  return (
    <div
      className={cn("performance-fade-in", className)}
      style={
        {
          ...style,
          "--fade-delay": `${delay * 1000}ms`,
          "--fade-y": `${y}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}
