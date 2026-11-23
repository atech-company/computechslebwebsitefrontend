"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthMethods } from "@/components/account/auth-methods";

export function LoginForm() {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      <AuthMethods collectName={false} />
      <div className="relative text-center text-xs uppercase tracking-widest text-muted">
        <span className="relative z-10 bg-card px-3">{t("email")}</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">{t("email")}</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">{t("password")}</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("pleaseWait") : t("login")}
        </Button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <Link href="/account/register" className="text-blue-600 hover:underline">
            {t("register")}
          </Link>
          <Link
            href="/account/forgot-password"
            className="text-muted hover:text-foreground"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </form>
    </div>
  );
}
