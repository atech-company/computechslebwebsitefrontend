"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCartQuery,
  useCouponMutation,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/use-cart";
import { formatMoney } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations("cart");
  const { data: cart, isLoading, error } = useCartQuery();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const coupon = useCouponMutation();
  const [code, setCode] = useState("");

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-16">Loading cart…</div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-red-600">
        {(error as Error).message}
      </div>
    );
  }
  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("empty")}</p>
        <Button asChild className="mt-6">
          <Link href="/shop">{t("continue")}</Link>
        </Button>
      </div>
    );
  }

  const totals = cart.totals;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.4fr_0.8fr] sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <ul className="mt-8 space-y-6">
          {cart.items.map((item) => (
            <li
              key={item.key}
              className="flex gap-4 border-b border-border pb-6"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900">
                {item.images[0] ? (
                  <Image
                    src={item.images[0].src}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm">
                  {formatMoney(
                    item.totals.line_total,
                    item.totals.currency_minor_unit,
                    item.totals.currency_code,
                  )}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                    className="h-10 w-20 rounded-lg border border-border bg-background px-2"
                    onBlur={(e) => {
                      const quantity = Number(e.target.value);
                      if (quantity > 0 && quantity !== item.quantity) {
                        updateItem.mutate({ key: item.key, quantity });
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem.mutate({ key: item.key })}
                  >
                    {t("remove")}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t("total")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>{t("subtotal")}</dt>
            <dd>
              {formatMoney(
                totals.total_items,
                totals.currency_minor_unit,
                totals.currency_code,
              )}
            </dd>
          </div>
          {Number(totals.total_discount) > 0 ? (
            <div className="flex justify-between text-cyan-700 dark:text-cyan-300">
              <dt>Discount</dt>
              <dd>
                -
                {formatMoney(
                  totals.total_discount,
                  totals.currency_minor_unit,
                  totals.currency_code,
                )}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>{t("total")}</dt>
            <dd>
              {formatMoney(
                totals.total_price,
                totals.currency_minor_unit,
                totals.currency_code,
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("coupon")}
          />
          <Button
            type="button"
            variant="outline"
            disabled={!code || coupon.isPending}
            onClick={() =>
              coupon.mutate({ code, action: "apply" }, { onSuccess: () => setCode("") })
            }
          >
            {t("apply")}
          </Button>
        </div>
        {cart.coupons.map((c) => (
          <div key={c.code} className="mt-2 flex items-center justify-between text-sm">
            <span>{c.code}</span>
            <button
              type="button"
              className="text-red-600"
              onClick={() => coupon.mutate({ code: c.code, action: "remove" })}
            >
              Remove
            </button>
          </div>
        ))}

        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/checkout">{t("checkout")}</Link>
        </Button>
      </aside>
    </div>
  );
}
