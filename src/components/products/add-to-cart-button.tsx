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
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-stretch", className)}>
      <div className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-32">
        <button
          type="button"
          onClick={() => setQuantity((current) => clamp(current - 1))}
          disabled={quantity <= minQuantity || addToCart.isPending}
          className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-slate-100 hover:text-foreground disabled:opacity-35 dark:hover:bg-slate-800"
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
          className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-slate-100 hover:text-foreground disabled:opacity-35 dark:hover:bg-slate-800"
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
        className="flex-1 shadow-lg shadow-blue-600/20"
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
          className="flex-1"
        >
          {t("buyNow")}
        </Button>
      ) : null}
    </div>
  );
}
