import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import {
  grantCampaignAdmin,
  isCampaignAdmin,
  readCampaignFile,
  writeCampaignFile,
} from "@/lib/homepage/campaign-admin";

const slideSchema = z.object({
  id: z.string().min(1).max(80),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).max(99),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  layout: z.enum(["stage", "studio", "folio", "plate", "offer"]),
  animation: z.enum(["drift", "none"]),
  eyebrow: z.string().max(80).optional(),
  eyebrowAr: z.string().max(80).optional(),
  title: z.string().min(1).max(160),
  titleAr: z.string().max(160).optional(),
  subtitle: z.string().max(320).optional(),
  subtitleAr: z.string().max(320).optional(),
  cta: z.string().min(1).max(80),
  ctaAr: z.string().max(80).optional(),
  href: z.string().min(1).max(240),
  desktopImage: z.string().min(1).max(500),
  mobileImage: z.string().min(1).max(500),
  imageAlt: z.string().min(1).max(180),
  desktopPosition: z.string().max(40).optional(),
  mobilePosition: z.string().max(40).optional(),
});

const fileSchema = z.object({
  autoplayMs: z.number().int().min(3000).max(20000),
  animation: z.enum(["slide", "fade"]),
  pauseOnHover: z.boolean(),
  slides: z.array(slideSchema).min(1).max(8),
});

function tokensMatch(input: string, expected: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET() {
  if (!(await isCampaignAdmin())) {
    return jsonOk({ authorized: false }, { status: 401 });
  }
  const file = await readCampaignFile();
  return jsonOk({ authorized: true, file });
}

export async function PUT(request: Request) {
  try {
    if (!(await isCampaignAdmin())) {
      return jsonOk({ message: "Sign in required" }, { status: 401 });
    }
    const file = fileSchema.parse(await request.json());
    await writeCampaignFile(file);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const expected = process.env.ADMIN_CAMPAIGN_TOKEN?.trim() || "";
    const body = z.object({ token: z.string().min(1) }).parse(await request.json());
    if (!expected || !tokensMatch(body.token, expected)) {
      return jsonOk({ message: "Incorrect token" }, { status: 401 });
    }
    await grantCampaignAdmin();
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
