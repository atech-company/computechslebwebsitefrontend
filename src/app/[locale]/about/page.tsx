import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold tracking-[0.2em] text-cyan-600">
        COMPUTECHS
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">About</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Computechs is a Lebanon-based electronics retailer for laptops, PC
        components, monitors, accessories, and creative technology. This
        storefront reads live catalog, stock, and pricing from our WooCommerce
        backend.
      </p>
    </div>
  );
}
