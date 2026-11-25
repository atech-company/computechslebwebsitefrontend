"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Headphones,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAddToCart } from "@/hooks/use-cart";
import { useRouter } from "@/i18n/navigation";
import { formatMoney, toMinorUnits } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { ProductCardModel } from "@/types/woocommerce";

function resolveQuantityBounds(product: ProductCardModel) {
  const min = Math.max(1, product.addToCart.minimum || 1);
  let max = product.addToCart.maximum;
  if (!Number.isFinite(max) || max <= 0) max = 99;
  if (product.lowStockRemaining != null && product.lowStockRemaining >= 0) {
    max = Math.min(max, Math.max(min, product.lowStockRemaining));
  }
  return { min, max: Math.max(min, max) };
}

export function ProductPurchasePanel({
  product,
  whatsappUrl,
}: {
  product: ProductCardModel;
  whatsappUrl?: string | null;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const addToCart = useAddToCart();
  const setCartDrawerOpen = useUiStore((state) => state.setCartDrawerOpen);
  const { min, max } = resolveQuantityBounds(product);
  const [quantity, setQuantity] = useState(min);
  const [justAdded, setJustAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    setQuantity((current) => Math.min(max, Math.max(min, current)));
  }, [min, max, product.id]);

  useEffect(() => {
    if (!product.isInStock) return;
    const target = document.getElementById("product-buy-actions");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry?.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product.isInStock, product.id]);

  const moneyLocale = locale === "ar" ? "ar" : "en-US";
  const totals = useMemo(() => {
    const minor = product.currencyMinorUnit || 2;
    const unit = toMinorUnits(product.price, minor);
    const regular = toMinorUnits(product.regularPrice, minor);
    const unitSaving =
      product.onSale && regular > unit ? regular - unit : 0;
    return {
      unitFormatted: formatMoney(unit, minor, product.currencyCode, moneyLocale),
      regularFormatted: formatMoney(regular, minor, product.currencyCode, moneyLocale),
      totalFormatted: formatMoney(unit * quantity, minor, product.currencyCode, moneyLocale),
      savingsFormatted: formatMoney(
        unitSaving * quantity,
        minor,
        product.currencyCode,
        moneyLocale,
      ),
      hasSavings: unitSaving > 0,
    };
  }, [product, quantity, moneyLocale]);

  const pending = addToCart.isPending;
  const disabled =
    !product.isPurchasable || !product.isInStock || pending || quantity < min;

  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  const submit = async (mode: "cart" | "buy") => {
    if (disabled) return;
    await addToCart.mutateAsync({ id: product.id, quantity });
    if (mode === "cart") {
      setJustAdded(true);
      setCartDrawerOpen(true);
      window.setTimeout(() => setJustAdded(false), 1600);
      return;
    }
    router.push("/checkout");
  };

  if (!product.isInStock) {
    return (
      <div id="product-buy-actions" className="mt-6">
        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            disabled
            className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-500"
          >
            {t("outOfStock")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="product-buy-actions" className="mt-6 min-w-0">
        <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {totals.unitFormatted}
              </p>
              {totals.hasSavings ? (
                <p className="text-sm text-slate-400 line-through">{totals.regularFormatted}</p>
              ) : null}
            </div>
            <div className="flex h-11 shrink-0 items-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setQuantity((current) => clamp(current - 1))}
                disabled={quantity <= min || pending}
                className="grid h-11 w-11 place-items-center text-slate-700 transition duration-200 hover:bg-slate-50 disabled:opacity-35 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={t("decreaseQuantity")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => clamp(current + 1))}
                disabled={quantity >= max || pending}
                className="grid h-11 w-11 place-items-center text-slate-700 transition duration-200 hover:bg-slate-50 disabled:opacity-35 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={t("increaseQuantity")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">{t("totalAmount")}</p>
              {totals.hasSavings ? (
                <p className="mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {t("youSave", { amount: totals.savingsFormatted })}
                </p>
              ) : null}
            </div>
            <p className="text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
              {totals.totalFormatted}
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void submit("cart")}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition duration-200 hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : justAdded ? (
              <Check className="h-5 w-5" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
            {justAdded ? t("added") : t("addCountToCart", { count: quantity })}
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void submit("buy")}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] text-sm font-semibold text-white transition duration-200 hover:bg-black disabled:pointer-events-none disabled:opacity-50"
          >
            {t("buyNow")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white text-sm font-semibold text-emerald-700 transition duration-200 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            <MessageCircle className="h-5 w-5" />
            {t("whatsapp")}
          </a>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          {[
            { icon: Truck, label: t("localDelivery") },
            { icon: ShieldCheck, label: t("warrantySupport") },
            { icon: Headphones, label: t("expertHelp") },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-w-0 flex-col items-center gap-1.5 text-center text-[11px] leading-snug text-slate-500 sm:text-xs"
            >
              <Icon className="h-4 w-4 text-slate-700 dark:text-slate-300" strokeWidth={1.75} />
              <span className="break-words">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {stickyVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-3 pt-2 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-7xl items-center gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <p className="min-w-0 flex-1 truncate text-base font-semibold tabular-nums text-slate-950 dark:text-white">
              {totals.totalFormatted}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void submit("cart")}
              className="flex h-12 min-w-0 flex-[1.15] items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 shrink-0" />
              )}
              <span className="truncate">
                {justAdded ? t("added") : t("addCountToCart", { count: quantity })}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
