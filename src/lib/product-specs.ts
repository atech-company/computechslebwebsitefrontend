import { stripHtml } from "@/lib/utils";
import type { ProductCardModel, StoreAttribute } from "@/types/woocommerce";

export interface SpecificationPresentation {
  icon: SpecificationIconName;
  accent: string;
}

export type SpecificationIconName =
  | "processor"
  | "memory"
  | "storage"
  | "display"
  | "graphics"
  | "battery"
  | "connectivity"
  | "keyboard"
  | "camera"
  | "operatingSystem"
  | "ports"
  | "dimensions"
  | "color"
  | "warranty"
  | "generic";

const SPECIFICATION_STYLES: Array<{
  pattern: RegExp;
  presentation: SpecificationPresentation;
}> = [
  {
    pattern: /processor|cpu|chip|core/i,
    presentation: {
      icon: "processor",
      accent: "from-blue-500/18 via-blue-500/6 to-transparent",
    },
  },
  {
    pattern: /memory|ram/i,
    presentation: {
      icon: "memory",
      accent: "from-violet-500/18 via-violet-500/6 to-transparent",
    },
  },
  {
    pattern: /storage|ssd|nvme|hard|hdd/i,
    presentation: {
      icon: "storage",
      accent: "from-cyan-500/18 via-cyan-500/6 to-transparent",
    },
  },
  {
    pattern: /display|screen|resolution|touch/i,
    presentation: {
      icon: "display",
      accent: "from-sky-500/18 via-sky-500/6 to-transparent",
    },
  },
  {
    pattern: /graphic|gpu|video/i,
    presentation: {
      icon: "graphics",
      accent: "from-fuchsia-500/18 via-fuchsia-500/6 to-transparent",
    },
  },
  {
    pattern: /battery|power/i,
    presentation: {
      icon: "battery",
      accent: "from-emerald-500/18 via-emerald-500/6 to-transparent",
    },
  },
  {
    pattern: /wifi|wireless|bluetooth|network|connect/i,
    presentation: {
      icon: "connectivity",
      accent: "from-indigo-500/18 via-indigo-500/6 to-transparent",
    },
  },
  {
    pattern: /keyboard/i,
    presentation: {
      icon: "keyboard",
      accent: "from-amber-500/18 via-amber-500/6 to-transparent",
    },
  },
  {
    pattern: /camera|webcam/i,
    presentation: {
      icon: "camera",
      accent: "from-rose-500/18 via-rose-500/6 to-transparent",
    },
  },
  {
    pattern: /system|windows|operating|\bos\b/i,
    presentation: {
      icon: "operatingSystem",
      accent: "from-blue-500/18 via-cyan-500/6 to-transparent",
    },
  },
  {
    pattern: /port|usb|hdmi|thunderbolt/i,
    presentation: {
      icon: "ports",
      accent: "from-orange-500/18 via-orange-500/6 to-transparent",
    },
  },
  {
    pattern: /weight|dimension|size/i,
    presentation: {
      icon: "dimensions",
      accent: "from-teal-500/18 via-teal-500/6 to-transparent",
    },
  },
  {
    pattern: /color|colour|finish/i,
    presentation: {
      icon: "color",
      accent: "from-pink-500/18 via-pink-500/6 to-transparent",
    },
  },
  {
    pattern: /warranty|guarantee/i,
    presentation: {
      icon: "warranty",
      accent: "from-emerald-500/18 via-emerald-500/6 to-transparent",
    },
  },
];

const FALLBACK: SpecificationPresentation = {
  icon: "generic",
  accent: "from-slate-500/14 via-slate-500/5 to-transparent",
};

export function getSpecificationPresentation(
  name: string,
): SpecificationPresentation {
  return (
    SPECIFICATION_STYLES.find(({ pattern }) => pattern.test(name))
      ?.presentation ?? FALLBACK
  );
}

const LABELED_SPEC_NAMES = [
  "Processor",
  "CPU",
  "Memory",
  "RAM",
  "Storage",
  "Graphics",
  "GPU",
  "Display",
  "Screen",
  "Operating System",
  "OS",
  "Connectivity",
  "Color",
  "Colour",
  "Condition",
  "Model",
  "Design",
  "Battery",
  "Warranty",
  "Ports",
] as const;

const SPEC_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "Processor",
    pattern:
      /((?:Intel\s+)?(?:Ai\s+)?Core(?:™)?\s+(?:Ultra\s+)?(?:i?[3579]|\d{1,2})[\s-]+\d{3,5}[A-Z0-9]*(?:\s*\([^)]*gen\))?|(?:AMD\s+)?Ryzen\s+[3579]\s+\d{4,5}[A-Z0-9]*)/i,
  },
  {
    name: "Memory",
    pattern: /\b(\d{1,3}\s?GB(?:\s+DDR\d?)?(?:\s+RAM)?)\b/i,
  },
  {
    name: "Storage",
    pattern: /\b(\d+(?:\.\d+)?\s?(?:TB|GB)\s*(?:NVMe|SSD|HDD))\b/i,
  },
  {
    name: "Display",
    pattern:
      /\b(\d{2}(?:\.\d+)?\s*(?:"|inch|inches)\s*(?:(?:FHD|QHD|UHD|OLED|IPS)\+?)?(?:\s+touchscreen|\s+touch)?)/i,
  },
  {
    name: "Graphics",
    pattern: /\b((?:NVIDIA\s+)?(?:RTX|GTX)\s?\d{3,4}\s?[A-Z]*|ARC\s?\d{2,4}[A-Z]*|Iris(?:®)?\s+Xe|Radeon\s+[A-Z0-9 ]+)/i,
  },
  {
    name: "Operating System",
    pattern: /\b((?:Windows|Win)\s*1[01](?:\s+Pro)?|macOS\s*[A-Za-z0-9.]*)\b/i,
  },
  {
    name: "Color",
    pattern: /\b(Arctic Grey|Space Gray|Midnight|Silver|Black|Blue|White|Gold|Grey|Gray)\b/i,
  },
  {
    name: "Condition",
    pattern: /\b(Used|Refurbished|Open Box|Brand New|New)\b/i,
  },
];

function createAttribute(id: number, name: string, value: string): StoreAttribute {
  return {
    id,
    name,
    taxonomy: "",
    has_variations: false,
    terms: [{ id, name: value.trim(), slug: "" }],
  };
}

function normalizeCatalogText(value: string): string {
  return stripHtml(value)
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#8243;|&Prime;|&quot;/gi, '"')
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractProductSpecifications(
  product: ProductCardModel,
): StoreAttribute[] {
  if (product.attributes.length) return product.attributes;

  const text = normalizeCatalogText(
    `${product.name}. ${product.shortDescription}. ${product.description}`,
  );
  const specs: StoreAttribute[] = [];
  const usedNames = new Set<string>();
  let nextId = -1;

  const labelAlternation = LABELED_SPEC_NAMES.map((label) =>
    label.replace(/\s+/g, "\\s+"),
  ).join("|");

  for (const label of LABELED_SPEC_NAMES) {
    const escapedLabel = label.replace(/\s+/g, "\\s+");
    const match = text.match(
      new RegExp(
        `(?:^|[.·;])\\s*${escapedLabel}\\s*:\\s*(.{1,140}?)(?=\\s+(?:${labelAlternation})\\s*:|[.;]\\s+[A-Z][a-z]+\\s*:|$)`,
        "i",
      ),
    );
    const value = match?.[1]?.trim();
    if (!value) continue;
    const canonicalName = label === "CPU" ? "Processor" : label === "RAM" ? "Memory" : label === "GPU" ? "Graphics" : label === "Screen" ? "Display" : label === "OS" ? "Operating System" : label === "Colour" ? "Color" : label;
    if (usedNames.has(canonicalName)) continue;
    specs.push(createAttribute(nextId--, canonicalName, value));
    usedNames.add(canonicalName);
  }

  for (const { name, pattern } of SPEC_PATTERNS) {
    if (usedNames.has(name)) continue;
    const value = text.match(pattern)?.[1]?.trim();
    if (!value) continue;
    specs.push(createAttribute(nextId--, name, value));
    usedNames.add(name);
  }

  return specs;
}
