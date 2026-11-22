import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 text-muted">
        Reach the Computechs team for product advice, warranty questions, and
        order support.
      </p>
      {wa ? (
        <Button asChild className="mt-8" size="lg">
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>
        </Button>
      ) : (
        <p className="mt-8 text-sm text-muted">
          Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable WhatsApp contact.
        </p>
      )}
    </div>
  );
}
