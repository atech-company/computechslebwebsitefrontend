import { setRequestLocale } from "next-intl/server";
import { CampaignEditor, CampaignLogin } from "@/components/admin/campaign-editor";
import {
  isCampaignAdmin,
  readCampaignFile,
} from "@/lib/homepage/campaign-admin";

type Props = { params: Promise<{ locale: string }> };

export const metadata = { title: "Campaign editor" };

export default async function CampaignAdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const allowed = await isCampaignAdmin();
  if (!allowed) {
    return (
      <div className="mx-auto max-w-7xl px-4">
        <CampaignLogin />
      </div>
    );
  }
  const file = await readCampaignFile();
  return <CampaignEditor initial={file} />;
}
