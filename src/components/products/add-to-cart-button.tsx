"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, LoaderCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

interface AddToCartButtonProps {
  productId: number;
  isPurchasable?: boolean;
  isInStock?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  className?: string;
  showBuyNow?: boolean;
  openCartOnSuccess?: boolean;
}

export function AddToCartButton({
  productId,
  isPurchasable = true,
  isInStock = true,
  minQuantity = 1,
  maxQuantity = 99,
  className,
  showBuyNow = true,
  openCartOnSuccess = false,
}: AddToCartButtonProps) {
  const t = useTranslations("product");
  const router = useRouter();
  const addToCart = useAddToCart();
  const setCartDrawerOpen = useUiStore((state) => state.setCartDrawerOpen);
  const [quantity, setQuantity] = useState(minQuantity);
  const [justAdded, setJustAdded] = useState(false);

  const disabled =
    !isPurchasable || !isInStock || addToCart.isPending || quantity < minQuantity;

  const clamp = (value: number) =>
    Math.min(maxQuantity, Math.max(minQuantity, value));

  const handleAdd = async () => {
    await addToCart.mutateAsync({ id: productId, quantity });
    setJustAdded(true);
    if (openCartOnSuccess) setCartDrawerOpen(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = async () => {
    await addToCart.mutateAsync({ id: productId, quantity });
    router.push("/checkout");
  };

  if (!isInStock) {
    return (
      <Button type="button" disabled className={cn("w-full", className)}>
        {t("outOfStock")}
      </Button>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-wrap gap-2", className)}>
      <div className="flex h-12 w-[7.25rem] shrink-0 items-center justify-between rounded-xl border border-slate-200 bg-white px-1 dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setQuantity((current) => clamp(current - 1))}
          disabled={quantity <= minQuantity || addToCart.isPending}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 disabled:opacity-35 dark:text-slate-200"
          aria-label={t("decreaseQuantity")}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-6 text-center text-sm font-semibold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => clamp(current + 1))}
          disabled={quantity >= maxQuantity || addToCart.isPending}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 disabled:opacity-35 dark:text-slate-200"
          aria-label={t("increaseQuantity")}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        onClick={handleAdd}
        className="min-w-0 flex-1 px-3 text-sm sm:px-5 sm:text-base"
      >
        {addToCart.isPending ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : justAdded ? (
          <Check className="h-5 w-5" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
        {justAdded ? t("added") : t("addToCart")}
      </Button>
      {showBuyNow ? (
        <Button
          type="button"
          size="lg"
          variant="cyan"
          disabled={disabled}
          onClick={handleBuyNow}
          className="min-w-0 flex-[1_1_100%] px-3 text-center text-sm sm:flex-[1_1_auto] sm:px-5 sm:text-base"
        >
          {t("buyNow")}
        </Button>
      ) : null}
    </div>
  );
}
