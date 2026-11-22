import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CatalogUnavailable({
  title = "Catalog temporarily unavailable",
  message = "We could not load products from WooCommerce just now. Please try again in a moment.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted">{message}</p>
      <Button asChild className="mt-6">
        <Link href="/shop">Back to shop</Link>
      </Button>
    </div>
  );
}
