"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthMethods } from "@/components/account/auth-methods";

export function RegisterForm() {
  const t = useTranslations("account");
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error") === "google";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    googleError ? t("googleFailed") : null,
  );

  const initialError = useMemo(
    () => (googleError ? t("googleFailed") : null),
    [googleError, t],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(form.get("firstName") || ""),
          lastName: String(form.get("lastName") || ""),
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || t("authError"));
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError(t("authError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <AuthMethods collectName />
      <div className="relative text-center text-xs uppercase tracking-widest text-muted">
        <span className="relative z-10 bg-card px-3">{t("registerWithEmail")}</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-first">{t("firstName")}</Label>
            <Input
              id="reg-first"
              name="firstName"
              autoComplete="given-name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-last">{t("lastName")}</Label>
            <Input
              id="reg-last"
              name="lastName"
              autoComplete="family-name"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">{t("email")}</Label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">{t("password")}</Label>
          <Input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-xs text-muted">{t("passwordHint")}</p>
        </div>
        {error || initialError ? (
          <p className="text-sm text-red-600">{error || initialError}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("pleaseWait") : t("register")}
        </Button>
        <p className="text-center text-sm">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/account/login" className="text-blue-600 hover:underline">
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
