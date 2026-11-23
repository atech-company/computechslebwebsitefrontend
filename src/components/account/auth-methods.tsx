"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.4a6 6 0 0 1 0-4.8L3.3 7.1a10 10 0 0 0 0 9.8l3.3-2.5z"
      />
      <path
        fill="#4285F4"
        d="M12 6.2c1.3 0 2.5.5 3.4 1.3l2.5-2.5A8.6 8.6 0 0 0 12 3a9.9 9.9 0 0 0-8.7 4.1l3.3 2.5A6 6 0 0 1 12 6.2z"
      />
      <path
        fill="#FBBC05"
        d="M12 21a8.6 8.6 0 0 0 5.9-2.1l-3.1-2.4A6 6 0 0 1 6.6 14.4l-3.3 2.5A9.9 9.9 0 0 0 12 21z"
      />
    </svg>
  );
}

export function AuthMethods({
  collectName,
}: {
  collectName: boolean;
}) {
  const t = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          firstName: collectName ? firstName : undefined,
          lastName: collectName ? lastName : undefined,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        devOtp?: string;
      };
      if (!response.ok) {
        setError(data.message || t("authError"));
        return;
      }
      setSent(true);
      setDevOtp(data.devOtp || null);
    } catch {
      setError(t("authError"));
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          firstName: collectName ? firstName : undefined,
          lastName: collectName ? lastName : undefined,
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
    <div className="space-y-4">
      <Button variant="outline" className="w-full" asChild>
        <a href={`/api/auth/google?locale=${locale}`}>
          <GoogleIcon />
          {t("continueWithGoogle")}
        </a>
      </Button>

      <div className="relative py-1 text-center text-xs uppercase tracking-widest text-muted">
        <span className="relative z-10 bg-card px-3">{t("orContinueWith")}</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={sent ? verifyCode : sendCode}>
        {collectName ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone-first">{t("firstName")}</Label>
              <Input
                id="phone-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone-last">{t("lastName")}</Label>
              <Input
                id="phone-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone">{t("phone")}</Label>
          <Input
            id="reg-phone"
            type="tel"
            inputMode="tel"
            placeholder="+961 71 123 456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>
        {sent ? (
          <div className="space-y-1.5">
            <Label htmlFor="reg-otp">{t("otp")}</Label>
            <Input
              id="reg-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t("otpPlaceholder")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {devOtp ? (
              <p className="text-xs text-cyan-700 dark:text-cyan-400">
                {t("devOtpHint", { code: devOtp })}
              </p>
            ) : (
              <p className="text-xs text-muted">{t("codeSent")}</p>
            )}
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
          {pending
            ? t("pleaseWait")
            : sent
              ? t("verifyCode")
              : t("continueWithPhone")}
        </Button>
      </form>
    </div>
  );
}
