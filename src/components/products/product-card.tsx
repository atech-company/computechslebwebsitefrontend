"use client";

import Image from "next/image";
import {
  Check,
  GitCompareArrows,
  Heart,
  LoaderCircle,
  Settings2,
  ShoppingCart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductPrice } from "@/components/products/product-price";
import { ProductQuickView } from "@/components/products/product-quick-view";
import { useAddToCart } from "@/hooks/use-cart";
import { useCompareStore } from "@/stores/compare-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn, formatProductDisplayName } from "@/lib/utils";
import type { ProductCardModel } from "@/types/woocommerce";
import type { AppLocale } from "@/i18n/routing";

interface ProductCardProps {
  product: ProductCardModel;
  locale?: AppLocale | string;
  className?: string;
}

export function ProductCard({
  product,
  locale = "en",
  className,
}: ProductCardProps) {
  const t = useTranslations("product");
  const mounted = useHydrated();
  const wished = useWishlistStore((s) => s.has(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const compared = useCompareStore((s) => s.has(product.id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const setCartDrawerOpen = useUiStore((s) => s.setCartDrawerOpen);
  const addToCart = useAddToCart();

  const isWished = mounted && wished;
  const isCompared = mounted && compared;
  const imageSrc = product.image?.src;
  const displayName = formatProductDisplayName(product.name);
  const imageAlt = product.image?.alt || displayName;
  const added = addToCart.isSuccess && !addToCart.isPending;

  const handleAddToCart = async () => {
    await addToCart.mutateAsync({
      id: product.id,
      quantity: product.addToCart.minimum || 1,
    });
    setCartDrawerOpen(true);
  };

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
      data-locale={locale}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
          aria-label={displayName}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {t("noImage")}
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute start-2 top-2 z-10 flex max-w-[calc(100%-3.25rem)] flex-wrap gap-1.5 sm:start-3 sm:top-3 sm:max-w-[calc(100%-4rem)]">
          {product.onSale ? (
            <Badge
              variant="sale"
              className="h-6 px-2 text-[11px] font-bold shadow-sm ring-1 ring-white/70 sm:h-auto sm:px-2.5 sm:text-xs sm:font-medium sm:shadow-none sm:ring-0"
            >
              {product.discountPercent
                ? `-${product.discountPercent}%`
                : t("sale")}
            </Badge>
          ) : null}
          <Badge
            variant={product.isInStock ? "stock" : "secondary"}
            className="hidden sm:inline-flex"
          >
            {product.stockText ||
              (product.isInStock ? t("inStock") : t("outOfStock"))}
          </Badge>
        </div>

        <Badge
          variant={product.isInStock ? "stock" : "secondary"}
          title={
            product.stockText ||
            (product.isInStock ? t("inStock") : t("outOfStock"))
          }
          className={cn(
            "pointer-events-none absolute bottom-2 start-2 z-10 h-6 max-w-[calc(100%-1rem)] gap-1.5 truncate border-white/70 bg-white/90 px-2 text-[11px] font-semibold shadow-md ring-1 ring-slate-900/5 backdrop-blur-md sm:hidden",
            product.isInStock
              ? "text-emerald-800"
              : "bg-rose-50/95 text-rose-700",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              product.isInStock ? "bg-emerald-500" : "bg-rose-500",
            )}
          />
          <span className="truncate">
            {product.isInStock ? t("inStock") : t("outOfStock")}
          </span>
        </Badge>

        <div className="pointer-events-auto absolute end-2 top-2 z-10 flex flex-col gap-1.5 sm:end-3 sm:top-3">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={cn(
                "h-8 w-8 rounded-full bg-white/90 shadow-sm backdrop-blur sm:h-9 sm:w-9 dark:bg-slate-900/90",
                isWished && "border-cyan-400 text-cyan-600",
              )}
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWished}
              onClick={() => toggleWish(product.id)}
            >
              <Heart className={cn("h-4 w-4", isWished && "fill-current")} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={cn(
                "h-8 w-8 rounded-full bg-white/90 shadow-sm backdrop-blur sm:h-9 sm:w-9 dark:bg-slate-900/90",
                isCompared && "border-blue-400 text-blue-600",
              )}
              aria-label={isCompared ? "Remove from compare" : "Add to compare"}
              aria-pressed={isCompared}
              onClick={() => toggleCompare(product.id)}
            >
              <GitCompareArrows className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        {product.brands?.[0] ? (
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.brands[0].name}
          </p>
        ) : null}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-cyan-400"
        >
          {displayName}
        </Link>
        <ProductPrice product={product} className="mt-auto pt-1" />

        <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <ProductQuickView
            product={product}
            triggerClassName="w-full min-w-0 px-2 [&_span]:max-sm:sr-only"
          />
          {product.hasOptions ? (
            <Button asChild size="sm" className="w-full min-w-0 px-2 sm:px-3">
              <Link href={`/product/${product.slug}`}>
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("chooseOptions")}</span>
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.isPurchasable || !product.isInStock || addToCart.isPending}
              className="w-full min-w-0 px-2 sm:px-3"
              aria-label={`${t("addToCart")}: ${displayName}`}
            >
              {addToCart.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : added ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {added ? t("added") : t("addToCart")}
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
