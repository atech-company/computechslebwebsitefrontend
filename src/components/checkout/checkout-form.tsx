"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Navigation,
  Rocket,
} from "lucide-react";
import { useCartQuery } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import {
  isWooCommerceOrderReceivedUrl,
  WP_CHECKOUT_FALLBACK,
} from "@/lib/woocommerce/checkout-redirect";
import type { StoreCart, StoreCheckout } from "@/types/woocommerce";

const DEFAULT_PAYMENT = "whish_by_codnloc";
const DEFAULT_POSTCODE = "0000";

const checkoutSchema = z.object({
  email: z.string().email(),
  full_name: z
    .string()
    .trim()
    .min(3, "Enter your full name")
    .refine((value) => value.split(/\s+/).length >= 2, "Enter your full name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  city: z.string().trim().min(2, "Enter your city"),
  location: z.string().trim().url("Add a valid Google Maps link"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function splitFullName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const { data: cart, isLoading: cartLoading } = useCartQuery();
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGatewayError, setIsGatewayError] = useState(false);
  const [submissionUncertain, setSubmissionUncertain] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "added" | "error"
  >("idle");
  const [notificationOrderId, setNotificationOrderId] = useState<number | null>(
    null,
  );
  const [success, setSuccess] = useState<{
    orderId: number;
    status: string;
    redirectUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      city: "",
      location: "",
    },
  });

  const locationValue = useWatch({ control, name: "location" });
  const paymentMethod = cart?.payment_methods?.[0] || DEFAULT_PAYMENT;
  const totals = cart?.totals;
  const items = cart?.items ?? [];
  const minor = totals?.currency_minor_unit ?? 2;
  const currency = totals?.currency_code || "USD";
  const checkoutWarmupKey = items
    .map((item) => `${item.key}:${item.quantity}`)
    .join("|");

  useEffect(() => {
    if (!checkoutWarmupKey) return;

    const controller = new AbortController();
    void fetch("/api/checkout", {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => response.text())
      .catch(() => undefined);

    return () => controller.abort();
  }, [checkoutWarmupKey]);

  useEffect(() => {
    if (!notificationOrderId) return;
    const timer = window.setTimeout(() => setNotificationOrderId(null), 6_000);
    return () => window.clearTimeout(timer);
  }, [notificationOrderId]);

  function primeSuccessSound() {
    try {
      const context = new AudioContext();
      void context.resume();
      window.setTimeout(() => {
        if (context.state !== "closed") void context.close();
      }, 30_000);
      return context;
    } catch {
      // Audio is an enhancement; checkout must still work if a browser blocks it.
      return null;
    }
  }

  function playSuccessSound(context: AudioContext | null) {
    if (!context) return;

    void context.resume().then(() => {
      const now = context.currentTime;
      [659.25, 783.99, 987.77].forEach((frequency, index) => {
        const start = now + index * 0.11;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.34);
      });
      window.setTimeout(() => {
        if (context.state !== "closed") void context.close();
      }, 1_000);
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = coords.latitude.toFixed(6);
        const longitude = coords.longitude.toFixed(6);
        setValue(
          "location",
          `https://www.google.com/maps?q=${latitude},${longitude}`,
          { shouldDirty: true, shouldValidate: true },
        );
        setLocationStatus("added");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  async function onSubmit(values: CheckoutFormValues) {
    if (submitting) return;
    if (!items.length) {
      setSubmitError(tCart("empty"));
      return;
    }
    const successAudio = primeSuccessSound();
    setSubmitting(true);
    setSubmitError(null);
    setIsGatewayError(false);
    setSubmissionUncertain(false);
    setSuccess(null);

    const { firstName, lastName } = splitFullName(values.full_name);
    const billing_address: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
      company: "",
      address_1: values.city,
      address_2: values.location,
      city: values.city,
      state: "",
      postcode: DEFAULT_POSTCODE,
      country: "LB",
      email: values.email,
      phone: values.phone,
    };
    const shipping_address: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
      company: "",
      address_1: values.city,
      address_2: values.location,
      city: values.city,
      state: "",
      postcode: DEFAULT_POSTCODE,
      country: "LB",
      phone: values.phone,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address,
          shipping_address,
          customer_note: `Google Maps pin: ${values.location}`,
          payment_method: paymentMethod,
        }),
      });
      const data = (await res.json()) as StoreCheckout & {
        message?: string;
        code?: string;
        details?: unknown;
      };

      if (!res.ok) {
        if (data.code === "timeout") {
          setSubmissionUncertain(true);
          setSubmitError(t("confirmationPending"));
          return;
        }
        const detailMessage =
          data.details &&
          typeof data.details === "object" &&
          "message" in data.details &&
          typeof (data.details as { message?: unknown }).message === "string"
            ? (data.details as { message: string }).message
            : "";
        const raw = data.message || detailMessage || "";
        const message =
          /already registered|already has an account/i.test(raw)
            ? t("emailInUse")
            : raw || tCommon("error");
        setSubmitError(message);
        const lower = message.toLowerCase();
        setIsGatewayError(
          lower.includes("payment") ||
            lower.includes("gateway") ||
            (data.code || "").toLowerCase().includes("payment"),
        );
        return;
      }

      if (!data.order_id) {
        setSubmitError(t("noOrderCreated"));
        return;
      }

      setSuccess({
        orderId: data.order_id,
        status: data.status || "unknown",
        redirectUrl: data.payment_result?.redirect_url || undefined,
      });
      setNotificationOrderId(data.order_id);
      playSuccessSound(successAudio);
      queryClient.setQueryData(["cart"], (previous: StoreCart | undefined) =>
        previous
          ? { ...previous, items: [], items_count: 0, coupons: [] }
          : previous,
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : tCommon("error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const paymentRedirectUrl =
      success.redirectUrl &&
      !isWooCommerceOrderReceivedUrl(success.redirectUrl)
        ? success.redirectUrl
        : null;

    return (
      <>
        <OrderSuccessNotification
          orderId={notificationOrderId}
          title={t("notificationTitle")}
          body={t("notificationBody", { id: success.orderId })}
        />
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-600">
            {t("orderPlaced")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {t("orderNumber", { id: success.orderId })}
          </h2>
          <p className="mt-2 text-muted">
            {t("orderStatus")}: {" "}
            <span className="text-foreground">{success.status}</span>
          </p>
          {paymentRedirectUrl ? (
            <Button asChild className="mt-6" size="lg">
              <a href={paymentRedirectUrl}>{t("continuePayment")}</a>
            </Button>
          ) : (
            <Button asChild className="mt-6" variant="outline">
              <Link href="/shop">{tCart("continue")}</Link>
            </Button>
          )}
        </div>
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]"
      noValidate
    >
      <div className="space-y-8">
        <p className="text-sm text-muted">{t("guestNote")}</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("deliveryDetails")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label={t("fullName")} error={errors.full_name?.message}>
                <Input
                  autoComplete="name"
                  placeholder={t("fullNamePlaceholder")}
                  {...register("full_name")}
                />
              </Field>
            </div>
            <Field label={t("email")} error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register("email")} />
            </Field>
            <Field label={t("phone")} error={errors.phone?.message}>
              <Input type="tel" autoComplete="tel" {...register("phone")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("city")} error={errors.city?.message}>
                <Input
                  autoComplete="address-level2"
                  placeholder={t("cityPlaceholder")}
                  {...register("city")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("mapPin")} error={errors.location?.message}>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600" />
                  <Input
                    dir="ltr"
                    className="ps-10"
                    placeholder={t("mapPlaceholder")}
                    {...register("location", {
                      onChange: () => setLocationStatus("idle"),
                    })}
                  />
                </div>
              </Field>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  disabled={locationStatus === "locating"}
                >
                  <Navigation className="h-4 w-4" />
                  {locationStatus === "locating"
                    ? t("locating")
                    : t("useCurrentLocation")}
                </Button>
                <Button asChild type="button" variant="ghost" size="sm">
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("openGoogleMaps")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              {locationStatus === "added" ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("locationAdded")}
                </p>
              ) : null}
              {locationStatus === "error" ? (
                <p className="mt-2 text-xs text-red-600">{t("locationError")}</p>
              ) : null}
              {locationValue && !errors.location ? (
                <a
                  href={locationValue}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-cyan-400"
                >
                  {t("viewMapPin")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {submitError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            <p>{submitError}</p>
            {isGatewayError ? (
              <p className="mt-2">
                {t("gatewayFallback")}{" "}
                <a
                  href={WP_CHECKOUT_FALLBACK}
                  className="font-medium underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("wpCheckoutLink")}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={submitting || submissionUncertain || !items.length}
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {t("placingOrder")}
            </>
          ) : submissionUncertain ? (
            t("doNotResubmit")
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              {t("placeOrder")}
            </>
          )}
        </Button>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">{t("orderSummary")}</h2>
        {cartLoading ? (
          <p className="mt-4 text-sm text-muted">{tCommon("loading")}</p>
        ) : !items.length ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted">{tCart("empty")}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/shop">{tCart("continue")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.key} className="flex justify-between gap-3 text-sm">
                  <span className="text-foreground">
                    {item.name}
                    <span className="text-muted"> × {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatMoney(
                      item.totals.line_total,
                      item.totals.currency_minor_unit,
                      item.totals.currency_code,
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {totals ? (
              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <Row
                  label={tCart("subtotal")}
                  value={formatMoney(totals.total_items, minor, currency)}
                />
                {Number.parseInt(totals.total_discount || "0", 10) > 0 ? (
                  <Row
                    label={t("discount")}
                    value={`−${formatMoney(totals.total_discount, minor, currency)}`}
                  />
                ) : null}
                {totals.total_shipping != null ? (
                  <Row
                    label={t("shippingTotal")}
                    value={formatMoney(totals.total_shipping, minor, currency)}
                  />
                ) : null}
                <Row
                  label={tCart("total")}
                  value={formatMoney(totals.total_price, minor, currency)}
                  strong
                />
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function OrderSuccessNotification({
  orderId,
  title,
  body,
}: {
  orderId: number | null;
  title: string;
  body: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {orderId ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0, y: -32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/15 bg-slate-950/90 p-3 text-start text-white shadow-2xl shadow-slate-950/35 backdrop-blur-2xl">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/25">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Computechs
                </p>
                <span className="text-[10px] text-white/50">now</span>
              </div>
              <p className="mt-0.5 text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-white/70">{body}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${strong ? "text-base font-semibold" : ""}`}
    >
      <span className={strong ? undefined : "text-muted"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
