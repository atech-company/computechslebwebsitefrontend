"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import {
  useCartQuery,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/use-cart";
import { formatMoney } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("cart");
  const open = useUiStore((s) => s.cartDrawerOpen);
  const setOpen = useUiStore((s) => s.setCartDrawerOpen);
  const { data: cart, isLoading, error } = useCartQuery();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const addingCount = useIsMutating({ mutationKey: ["cart", "add"] });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        {addingCount > 0 ? (
          <p
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-cyan-400"
            role="status"
          >
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {t("adding")}
          </p>
        ) : null}

        <div className="native-scroll mt-4 flex-1 space-y-4 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          ) : null}
          {!isLoading && cart && cart.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-muted">{t("empty")}</p>
              <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                <Link href="/shop">{t("continue")}</Link>
              </Button>
            </div>
          ) : null}
          {cart?.items.map((item) => (
            <div key={item.key} className="flex gap-3 border-b border-border pb-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900">
                {item.images[0] ? (
                  <Image
                    src={item.images[0].src}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-sm">
                  {formatMoney(
                    item.totals.line_total,
                    item.totals.currency_minor_unit,
                    item.totals.currency_code,
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    className="h-9 w-16 rounded-lg border border-border bg-background px-2 text-sm"
                    defaultValue={item.quantity}
                    onBlur={(e) => {
                      const quantity = Number(e.target.value);
                      if (quantity > 0 && quantity !== item.quantity) {
                        updateItem.mutate({ key: item.key, quantity });
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem.mutate({ key: item.key })}
                  >
                    {t("remove")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart && cart.items.length > 0 ? (
          <div className="mt-auto space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span>{t("total")}</span>
              <span className="font-semibold">
                {formatMoney(
                  cart.totals.total_price,
                  cart.totals.currency_minor_unit,
                  cart.totals.currency_code,
                )}
              </span>
            </div>
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link href="/cart">{t("title")}</Link>
            </Button>
            <Button
              asChild
              variant="cyan"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              <Link href="/checkout">{t("checkout")}</Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
