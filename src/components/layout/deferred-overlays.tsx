"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCartFromApi } from "@/hooks/use-cart";
import { useUiStore } from "@/stores/ui-store";
import type { SponsorCampaign } from "@/lib/sponsor-popup";

const loadCartDrawer = () =>
  import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer);
const CartDrawer = dynamic(
  loadCartDrawer,
  { ssr: false },
);
const DrivoPopup = dynamic(
  () =>
    import("@/components/sponsors/drivo-popup").then((mod) => mod.DrivoPopup),
  { ssr: false },
);

export function DeferredCartDrawer() {
  const open = useUiStore((state) => state.cartDrawerOpen);
  const [primed, setPrimed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    const warm = () => {
      void loadCartDrawer().then(() => {
        if (active) setPrimed(true);
      });
      void queryClient.prefetchQuery({
        queryKey: ["cart"],
        queryFn: fetchCartFromApi,
        staleTime: 20_000,
      });
    };
    if ("requestIdleCallback" in globalThis) {
      const id = globalThis.requestIdleCallback(warm, { timeout: 1_000 });
      return () => {
        active = false;
        globalThis.cancelIdleCallback(id);
      };
    }
    const id = globalThis.setTimeout(warm, 400);
    return () => {
      active = false;
      globalThis.clearTimeout(id);
    };
  }, [queryClient]);

  return open || primed ? <CartDrawer /> : null;
}

export function DeferredSponsorPopup({
  campaign,
  locale,
}: {
  campaign: SponsorCampaign;
  locale: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Keep promotional code and its large artwork outside the critical load and
    // initial scroll window. The campaign still applies its configured delay.
    const id = globalThis.setTimeout(() => setReady(true), 10_000);
    return () => globalThis.clearTimeout(id);
  }, []);

  return ready ? <DrivoPopup campaign={campaign} locale={locale} /> : null;
}
