import {
  AppWindow,
  BatteryCharging,
  Camera,
  Cpu,
  Gamepad2,
  HardDrive,
  Keyboard,
  MemoryStick,
  Monitor,
  Palette,
  Plug,
  Ruler,
  ShieldCheck,
  Sparkles,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpecificationIconName } from "@/lib/product-specs";

const SPECIFICATION_ICONS: Record<SpecificationIconName, LucideIcon> = {
  processor: Cpu,
  memory: MemoryStick,
  storage: HardDrive,
  display: Monitor,
  graphics: Gamepad2,
  battery: BatteryCharging,
  connectivity: Wifi,
  keyboard: Keyboard,
  camera: Camera,
  operatingSystem: AppWindow,
  ports: Plug,
  dimensions: Ruler,
  color: Palette,
  warranty: ShieldCheck,
  generic: Sparkles,
};

interface ProductSpecificationIconProps {
  icon: SpecificationIconName;
  className?: string;
}

export function ProductSpecificationIcon({
  icon,
  className,
}: ProductSpecificationIconProps) {
  const Icon = SPECIFICATION_ICONS[icon];
  return <Icon aria-hidden="true" className={cn("shrink-0", className)} />;
}
