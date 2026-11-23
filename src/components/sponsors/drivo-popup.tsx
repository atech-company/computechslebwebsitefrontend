"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  PackageCheck,
  X,
} from "lucide-react";
import {
  matchesDevice,
  matchesPath,
  type SponsorCampaign,
  type SponsorLocale,
} from "@/lib/sponsor-popup";

const STORAGE_PREFIX = "computechs-sponsor";

function storageKey(id: string) {
  return `${STORAGE_PREFIX}:${id}`;
}

function wasDismissed(campaign: SponsorCampaign): boolean {
  if (campaign.frequencyMode === "every_visit") return false;
  if (typeof window === "undefined") return true;
  if (campaign.frequencyMode === "session") {
    return sessionStorage.getItem(storageKey(campaign.id)) === "1";
  }
  const raw = localStorage.getItem(storageKey(campaign.id));
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at)) return false;
  const windowMs = Math.max(1, campaign.frequencyDays) * 24 * 60 * 60 * 1000;
  return Date.now() - at < windowMs;
}

function persistDismiss(campaign: SponsorCampaign) {
  if (campaign.frequencyMode === "every_visit") return;
  if (campaign.frequencyMode === "session") {
    sessionStorage.setItem(storageKey(campaign.id), "1");
    return;
  }
  localStorage.setItem(storageKey(campaign.id), String(Date.now()));
}

function PlayBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#34A853" d="M3 20.5v-17L14.5 12 3 20.5z" />
      <path fill="#FBBC04" d="M3 3.5 14.5 12 18 9.5 3 3.5z" />
      <path fill="#4285F4" d="M3 20.5 18 14.5 14.5 12 3 20.5z" />
      <path fill="#EA4335" d="M18 9.5 21.5 12 18 14.5 14.5 12z" />
    </svg>
  );
}

const HIGHLIGHT_ICONS = [CheckCircle2, PackageCheck, Clock3];

export function DrivoPopup({
  campaign,
  locale,
}: {
  campaign: SponsorCampaign;
  locale: string;
}) {
  const copy =
    campaign.copy[(locale as SponsorLocale)] || campaign.copy.en;
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("sponsorPreview") === "1";
    const path = window.location.pathname;
    if (!preview) {
      if (!matchesPath(campaign, path)) return;
      if (!matchesDevice(campaign, window.innerWidth)) return;
      if (wasDismissed(campaign)) return;
    }

    const delay = preview ? 200 : Math.max(0, campaign.delayMs);
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [campaign]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => setEntered(true));
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function dismiss() {
    persistDismiss(campaign);
    setEntered(false);
    window.setTimeout(() => setOpen(false), 220);
  }

  if (!open) return null;

  const vars = {
    "--drivo-accent": campaign.appearance.accent,
    "--drivo-soft": campaign.appearance.accentSoft,
    "--drivo-navy": campaign.appearance.navy,
    "--drivo-surface": campaign.appearance.surface,
  } as React.CSSProperties;

  return (
    <div
      className="drivo-popup"
      style={vars}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        type="button"
        className={`drivo-popup__backdrop ${entered ? "is-in" : ""}`}
        aria-label={copy.close}
        onClick={dismiss}
      />
      <div className={`drivo-popup__panel ${entered ? "is-in" : ""}`}>
        <div className="drivo-popup__orb drivo-popup__orb--one" aria-hidden />
        <div className="drivo-popup__orb drivo-popup__orb--two" aria-hidden />

        <button
          ref={closeRef}
          type="button"
          className="drivo-popup__close"
          onClick={dismiss}
          aria-label={copy.close}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="drivo-popup__grid">
          <div className="drivo-popup__copy">
            <p className="drivo-popup__badge">
              <span className="drivo-popup__pulse" aria-hidden />
              {copy.badge}
            </p>
            <h2 id={titleId} className="drivo-popup__title">
              {copy.title}
            </h2>
            <p id={descriptionId} className="drivo-popup__body">
              {copy.body}
            </p>
            <ul className="drivo-popup__highlights">
              {copy.highlights.map((item, index) => {
                const Icon = HIGHLIGHT_ICONS[index] || CheckCircle2;
                return (
                  <li key={item}>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
            <div className="drivo-popup__actions">
              <a
                className="drivo-popup__play"
                href={campaign.playUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PlayBadge />
                <span>
                  <small>Android</small>
                  {copy.playCta}
                </span>
              </a>
              <a
                className="drivo-popup__site"
                href={campaign.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.siteCta}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <button
              type="button"
              className="drivo-popup__dismiss"
              onClick={dismiss}
            >
              {copy.dismiss}
            </button>
          </div>

          <div className="drivo-popup__art">
            <div className="drivo-popup__art-frame">
              <Image
                src={campaign.image}
                alt={copy.imageAlt}
                width={720}
                height={1280}
                className="drivo-popup__image"
                sizes="(max-width: 768px) 86vw, 420px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
