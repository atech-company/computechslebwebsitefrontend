import { ProductCard } from "@/components/products/product-card";
import { catalogGridClass, type GridView } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import type { ProductCardModel } from "@/types/woocommerce";

interface ProductGridProps {
  products: ProductCardModel[];
  locale?: AppLocale | string;
  className?: string;
  columns?: GridView;
}

export function ProductGrid({
  products,
  locale = "en",
  className,
  columns = 4,
}: ProductGridProps) {
  const uniqueProducts = products.filter(
    (product, index, collection) =>
      collection.findIndex((candidate) => candidate.id === product.id) === index,
  );
  if (!uniqueProducts.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No products found
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6",
        catalogGridClass(columns),
        className,
      )}
    >
      {uniqueProducts.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
