"use client";

import Image from "next/image";
import { Eye, PackageCheck, Settings2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductPrice } from "@/components/products/product-price";
import { ProductSpecificationIcon } from "@/components/products/product-specification-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  extractProductSpecifications,
  getSpecificationPresentation,
} from "@/lib/product-specs";
import { formatProductDisplayName, getProductHeadline } from "@/lib/utils";
import type { ProductCardModel } from "@/types/woocommerce";

interface ProductQuickViewProps {
  product: ProductCardModel;
  triggerClassName?: string;
}

export function ProductQuickView({
  product,
  triggerClassName,
}: ProductQuickViewProps) {
  const t = useTranslations("product");
  const highlights = extractProductSpecifications(product).slice(0, 4);
  const imageSrc = product.image?.src;
  const displayName = formatProductDisplayName(product.name);
  const headline = getProductHeadline(product.name);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={triggerClassName}
          aria-label={`${t("quickView")}: ${displayName}`}
        >
          <Eye className="h-4 w-4" />
          <span>{t("quickView")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-0 bg-white p-0 shadow-[0_30px_100px_rgba(2,8,23,0.35)] dark:bg-slate-950">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="catalog-stage relative min-h-56 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 sm:min-h-[32rem] dark:from-slate-200 dark:via-slate-100 dark:to-blue-100">
            <div className="absolute start-8 top-8 z-10 flex flex-wrap gap-2">
              {product.onSale ? (
                <Badge variant="sale">
                  {product.discountPercent
                    ? `-${product.discountPercent}%`
                    : t("sale")}
                </Badge>
              ) : null}
              <Badge variant={product.isInStock ? "stock" : "secondary"}>
                {product.stockText ||
                  (product.isInStock ? t("inStock") : t("outOfStock"))}
              </Badge>
            </div>

            <div className="absolute inset-1/4 rounded-full bg-blue-400/15 blur-3xl" />
            {imageSrc ? (
              <div className="absolute inset-0 p-5 sm:p-10">
                <div className="relative h-full w-full">
                  <Image
                    src={imageSrc}
                    alt={product.image?.alt || displayName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-contain object-center transition-transform duration-500 hover:scale-[1.04]"
                  />
                </div>
              </div>
            ) : (
              <div className="relative flex h-full items-center justify-center text-muted">
                {t("noImage")}
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-9 lg:p-10">
            <DialogHeader className="pe-8 text-start">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-cyan-400">
                <Sparkles className="h-4 w-4" />
                {product.brands[0]?.name || t("featuredTech")}
              </div>
              <DialogTitle className="text-2xl leading-tight sm:text-3xl">
                {headline}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("quickViewDescription")}
              </DialogDescription>
            </DialogHeader>

            <ProductPrice product={product} className="mt-5 text-lg" />

            {product.shortDescription ? (
              <p className="mt-5 line-clamp-3 text-base leading-relaxed text-muted">
                {product.shortDescription}
              </p>
            ) : null}

            {highlights.length ? (
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {highlights.map((attribute) => {
                  const presentation = getSpecificationPresentation(attribute.name);
                  return (
                    <div
                      key={`${attribute.id}-${attribute.name}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <ProductSpecificationIcon
                          icon={presentation.icon}
                          className="h-4 w-4 text-blue-600 dark:text-cyan-400"
                        />
                        <span className="truncate">{attribute.name}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold">
                        {attribute.terms.map((term) => term.name).join(", ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-auto pt-7">
              {product.hasOptions ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={`/product/${product.slug}`}>
                    <Settings2 className="h-4 w-4" />
                    {t("chooseOptions")}
                  </Link>
                </Button>
              ) : (
                <AddToCartButton
                  productId={product.id}
                  isPurchasable={product.isPurchasable}
                  isInStock={product.isInStock}
                  minQuantity={product.addToCart.minimum}
                  maxQuantity={product.addToCart.maximum}
                  showBuyNow={false}
                  openCartOnSuccess
                />
              )}

              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link href={`/product/${product.slug}`}>
                  <PackageCheck className="h-4 w-4" />
                  {t("viewFullDetails")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
