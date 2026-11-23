import { z } from "zod";

const serverSchema = z.object({
  WOOCOMMERCE_URL: z
    .string()
    .url()
    .default("https://wp.computechsleb.com"),
  WC_CONSUMER_KEY: z.string().optional().default(""),
  WC_CONSUMER_SECRET: z.string().optional().default(""),
  WC_WEBHOOK_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional().default(""),
  AUTH_SECRET: z.string().optional().default(""),
  AUTH_GOOGLE_CLIENT_ID: z.string().optional().default(""),
  AUTH_GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  AUTH_TWILIO_ACCOUNT_SID: z.string().optional().default(""),
  AUTH_TWILIO_AUTH_TOKEN: z.string().optional().default(""),
  AUTH_TWILIO_FROM: z.string().optional().default(""),
  SPONSOR_POPUP_ENABLED: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse({
    WOOCOMMERCE_URL: process.env.WOOCOMMERCE_URL,
    WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY,
    WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET,
    WC_WEBHOOK_SECRET: process.env.WC_WEBHOOK_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    AUTH_TWILIO_ACCOUNT_SID: process.env.AUTH_TWILIO_ACCOUNT_SID,
    AUTH_TWILIO_AUTH_TOKEN: process.env.AUTH_TWILIO_AUTH_TOKEN,
    AUTH_TWILIO_FROM: process.env.AUTH_TWILIO_FROM,
    SPONSOR_POPUP_ENABLED: process.env.SPONSOR_POPUP_ENABLED,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function hasWcRestCredentials(): boolean {
  const env = getServerEnv();
  return Boolean(env.WC_CONSUMER_KEY && env.WC_CONSUMER_SECRET);
}

export function storeApiBase(): string {
  return `${getServerEnv().WOOCOMMERCE_URL.replace(/\/$/, "")}/wp-json/wc/store/v1`;
}

export function restApiBase(): string {
  return `${getServerEnv().WOOCOMMERCE_URL.replace(/\/$/, "")}/wp-json/wc/v3`;
}
