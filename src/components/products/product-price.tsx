import type { ProductCardModel } from "@/types/woocommerce";
import { cn } from "@/lib/utils";

interface ProductPriceProps {
  product: ProductCardModel;
  className?: string;
}

export function ProductPrice({ product, className }: ProductPriceProps) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {product.formattedPrice}
      </span>
      {product.onSale ? (
        <span className="text-sm text-slate-400 line-through dark:text-slate-500">
          {product.formattedRegularPrice}
        </span>
      ) : null}
    </div>
  );
}
