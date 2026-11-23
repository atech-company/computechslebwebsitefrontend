import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { signPayload, verifySignedPayload } from "@/lib/auth/crypto";
import type { HeroCampaignFile } from "@/lib/homepage/hero-slides";

export const CAMPAIGN_COOKIE = "computechs_campaign_admin";

export function campaignFilePath() {
  return path.join(process.cwd(), "content", "hero-campaigns.json");
}

export function campaignUploadDir() {
  return path.join(process.cwd(), "public", "hero", "uploads");
}

function adminToken() {
  return process.env.ADMIN_CAMPAIGN_TOKEN?.trim() || "";
}

export function campaignAdminDevOpen() {
  return process.env.NODE_ENV !== "production" && !adminToken();
}

export async function isCampaignAdmin(): Promise<boolean> {
  if (campaignAdminDevOpen()) return true;
  const token = adminToken();
  if (!token) return false;
  const jar = await cookies();
  const raw = jar.get(CAMPAIGN_COOKIE)?.value;
  if (!raw) return false;
  return verifySignedPayload(token, raw) === "campaign-admin";
}

export async function grantCampaignAdmin() {
  const token = adminToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(CAMPAIGN_COOKIE, signPayload(token, "campaign-admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function readCampaignFile(): Promise<HeroCampaignFile> {
  const raw = await readFile(campaignFilePath(), "utf8");
  return JSON.parse(raw) as HeroCampaignFile;
}

export async function writeCampaignFile(file: HeroCampaignFile) {
  await writeFile(campaignFilePath(), `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export async function saveCampaignUpload(file: File): Promise<string> {
  const allowed = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
  ]);
  const ext = allowed.get(file.type);
  if (!ext) {
    throw new Error("Upload a JPG, PNG, WebP, or AVIF image.");
  }
  if (file.size > 4_000_000) {
    throw new Error("Images must be 4 MB or smaller.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = campaignUploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/hero/uploads/${name}`;
}
