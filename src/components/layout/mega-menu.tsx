"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface MegaMenuCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  image?: { src: string; alt?: string } | null;
}

interface MegaMenuProps {
  categories: MegaMenuCategory[];
  className?: string;
}

export function MegaMenu({ categories, className }: MegaMenuProps) {
  const [activeParentId, setActiveParentId] = useState<number | null>(null);

  const { parents, childrenByParent } = useMemo(() => {
    const parents = categories
      .filter((c) => c.parent === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    const childrenByParent = new Map<number, MegaMenuCategory[]>();
    for (const cat of categories) {
      if (cat.parent === 0) continue;
      const list = childrenByParent.get(cat.parent) ?? [];
      list.push(cat);
      childrenByParent.set(cat.parent, list);
    }
    for (const [, list] of childrenByParent) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return { parents, childrenByParent };
  }, [categories]);

  const activeChildren =
    activeParentId != null ? (childrenByParent.get(activeParentId) ?? []) : [];

  if (parents.length === 0) return null;

  return (
    <nav
      className={cn("relative hidden lg:block", className)}
      aria-label="Categories"
      onMouseLeave={() => setActiveParentId(null)}
    >
      <ul className="flex items-center gap-1">
        {parents.map((parent) => {
          const hasChildren =
            (childrenByParent.get(parent.id)?.length ?? 0) > 0;
          const isOpen = activeParentId === parent.id;

          return (
            <li
              key={parent.id}
              onMouseEnter={() => setActiveParentId(parent.id)}
              className="relative"
            >
              <Link
                href={`/category/${parent.slug}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0B1120] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
                  isOpen &&
                    "bg-slate-100 text-[#0B1120] dark:bg-slate-800 dark:text-white",
                )}
              >
                {parent.name}
                {hasChildren ? (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {activeParentId != null && activeChildren.length > 0 ? (
        <div className="absolute left-0 top-full z-40 w-[min(100vw-2rem,36rem)] pt-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl shadow-[#0B1120]/10 backdrop-blur-xl dark:border-slate-700/80 dark:bg-[#0B1120]/95">
            <div className="grid gap-1 p-3 sm:grid-cols-2">
              {activeChildren.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  onClick={() => setActiveParentId(null)}
                >
                  {child.image?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={child.image.src}
                      alt={child.image.alt ?? child.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB]/15 to-[#06B6D4]/15 text-xs font-bold text-[#2563EB]">
                      {child.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#0B1120] group-hover:text-[#2563EB] dark:text-slate-100">
                      {child.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {child.count}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
