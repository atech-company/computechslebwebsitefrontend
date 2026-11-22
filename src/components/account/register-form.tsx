"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

export function RegisterForm() {
  const t = useTranslations("account");
  const [notice, setNotice] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(t("authComingSoon"));
  }

  return (
    <form className="mx-auto max-w-md space-y-4" onSubmit={onSubmit}>
      <p className="text-sm text-muted">{t("formsDeferred")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-first">{t("firstName")}</Label>
          <Input id="reg-first" name="firstName" autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-last">{t("lastName")}</Label>
          <Input id="reg-last" name="lastName" autoComplete="family-name" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email">{t("email")}</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">{t("password")}</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
      </div>
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <Button type="submit" className="w-full">
        {t("register")}
      </Button>
      <p className="text-center text-sm">
        <Link href="/account/login" className="text-blue-600 hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
