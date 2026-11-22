"use client";

import { useLocale, useTranslations } from "next-intl";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProductsByIds } from "@/hooks/use-products-by-ids";

export default function WishlistPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);
  const hydrated = useHydrated();
  const { data: products = [], isLoading, error } = useProductsByIds(ids);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("wishlist")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Saved locally until customer auth sync is available.
          </p>
        </div>
        {hydrated && ids.length > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={() => clear()}>
            Clear
          </Button>
        ) : null}
      </div>

      {!hydrated || (ids.length > 0 && isLoading) ? (
        <p className="text-muted">{tCommon("loading")}</p>
      ) : error ? (
        <p className="text-red-600">{(error as Error).message}</p>
      ) : !ids.length ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <Button asChild className="mt-6">
            <Link href="/shop">Browse products</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} locale={locale} />
      )}
    </div>
  );
}
