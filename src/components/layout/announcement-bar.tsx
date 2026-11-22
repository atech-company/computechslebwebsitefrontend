import { getTranslations } from "next-intl/server";

export async function AnnouncementBar() {
  const t = await getTranslations("common");

  return (
    <div className="bg-[#0B1120] text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      <p className="mx-auto max-w-7xl px-4 py-2.5">
        <span className="text-[#06B6D4]">{t("announcement")}</span>
      </p>
    </div>
  );
}
