"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/stores/ui-store";

interface Suggestion {
  products: Array<{
    id: number;
    name: string;
    slug: string;
    formattedPrice: string;
  }>;
  categories: Array<{ id: number; name: string; slug: string }>;
}

export function SearchDialog() {
  const t = useTranslations("nav");
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const trimmed = q.trim();

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggest", trimmed],
    enabled: open && trimmed.length > 0,
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      return (await res.json()) as Suggestion;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("search")}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
        />
        <div className="max-h-80 space-y-4 overflow-y-auto pt-2">
          {isFetching ? <p className="text-sm text-muted">Searching…</p> : null}
          {data?.categories?.length ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                Categories
              </p>
              <ul className="space-y-1">
                {data.categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => setOpen(false)}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data?.products?.length ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                Products
              </p>
              <ul className="space-y-1">
                {data.products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => setOpen(false)}
                    >
                      <span className="line-clamp-1">{p.name}</span>
                      <span className="shrink-0 text-muted">
                        {p.formattedPrice}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {trimmed &&
          !isFetching &&
          data &&
          !data.products?.length &&
          !data.categories?.length ? (
            <p className="text-sm text-muted">No results</p>
          ) : null}
        </div>
        {trimmed ? (
          <Link
            href={`/search?q=${encodeURIComponent(trimmed)}`}
            className="text-sm font-medium text-blue-600"
            onClick={() => setOpen(false)}
          >
            View all results
          </Link>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
