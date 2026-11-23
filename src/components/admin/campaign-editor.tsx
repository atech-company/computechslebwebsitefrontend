"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroCampaignFile } from "@/lib/homepage/hero-slides";

type Slide = NonNullable<HeroCampaignFile["slides"]>[number];

const layouts = ["stage", "studio", "folio", "plate", "offer"] as const;

export function CampaignLogin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setPending(false);
    if (!response.ok) {
      setError("That token was not accepted.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 py-16">
      <h1 className="text-2xl font-semibold">Campaign editor</h1>
      <p className="text-sm text-muted">
        Enter the admin token from <code>ADMIN_CAMPAIGN_TOKEN</code>.
      </p>
      <input
        type="password"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-card px-3"
        autoComplete="current-password"
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
      >
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-card px-3"
      />
    </label>
  );
}

export function CampaignEditor({ initial }: { initial: HeroCampaignFile }) {
  const [file, setFile] = useState<HeroCampaignFile>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateSlide(index: number, patch: Partial<Slide>) {
    setFile((current) => ({
      ...current,
      slides: (current.slides || []).map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }));
  }

  function move(index: number, direction: -1 | 1) {
    setFile((current) => {
      const slides = [...(current.slides || [])];
      const next = index + direction;
      if (next < 0 || next >= slides.length) return current;
      const [item] = slides.splice(index, 1);
      if (!item) return current;
      slides.splice(next, 0, item);
      return {
        ...current,
        slides: slides.map((slide, order) => ({ ...slide, order: order + 1 })),
      };
    });
  }

  async function upload(index: number, field: "desktopImage" | "mobileImage", image: File) {
    const body = new FormData();
    body.set("file", image);
    const response = await fetch("/api/admin/campaigns/upload", {
      method: "POST",
      body,
    });
    const data = (await response.json()) as { src?: string; message?: string };
    if (!response.ok || !data.src) {
      setMessage(data.message || "Upload failed");
      return;
    }
    updateSlide(index, { [field]: data.src });
  }

  async function save() {
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/admin/campaigns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...file,
        slides: (file.slides || []).map((slide, index) => ({
          ...slide,
          order: index + 1,
        })),
      }),
    });
    setPending(false);
    setMessage(response.ok ? "Saved. Refresh the homepage to see it." : "Could not save.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Homepage campaigns</h1>
          <p className="mt-2 text-sm text-muted">
            Order, copy, schedule, visibility, and desktop or mobile images.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
        >
          {pending ? "Saving…" : "Save campaigns"}
        </button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Autoplay (ms)</span>
          <input
            type="number"
            min={3000}
            max={20000}
            value={file.autoplayMs ?? 7000}
            onChange={(event) =>
              setFile((current) => ({
                ...current,
                autoplayMs: Number(event.target.value),
              }))
            }
            className="h-10 w-full rounded-lg border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Transition</span>
          <select
            value={file.animation || "slide"}
            onChange={(event) =>
              setFile((current) => ({
                ...current,
                animation: event.target.value === "fade" ? "fade" : "slide",
              }))
            }
            className="h-10 w-full rounded-lg border border-border px-3"
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium">
          <input
            type="checkbox"
            checked={file.pauseOnHover !== false}
            onChange={(event) =>
              setFile((current) => ({
                ...current,
                pauseOnHover: event.target.checked,
              }))
            }
          />
          Pause on hover
        </label>
      </div>

      {(file.slides || []).map((slide, index) => (
        <section key={slide.id || index} className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">{slide.title || `Slide ${index + 1}`}</h2>
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={() => move(index, -1)} className="rounded-lg border px-3 py-1">
                Up
              </button>
              <button type="button" onClick={() => move(index, 1)} className="rounded-lg border px-3 py-1">
                Down
              </button>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slide.enabled !== false}
                  onChange={(event) => updateSlide(index, { enabled: event.target.checked })}
                />
                Visible
              </label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="English title" value={slide.title || ""} onChange={(title) => updateSlide(index, { title })} />
            <Field label="Arabic title" value={slide.titleAr || ""} onChange={(titleAr) => updateSlide(index, { titleAr })} />
            <Field label="English subtitle" value={slide.subtitle || ""} onChange={(subtitle) => updateSlide(index, { subtitle })} />
            <Field label="Arabic subtitle" value={slide.subtitleAr || ""} onChange={(subtitleAr) => updateSlide(index, { subtitleAr })} />
            <Field label="English eyebrow" value={slide.eyebrow || ""} onChange={(eyebrow) => updateSlide(index, { eyebrow })} />
            <Field label="Arabic eyebrow" value={slide.eyebrowAr || ""} onChange={(eyebrowAr) => updateSlide(index, { eyebrowAr })} />
            <Field label="English button" value={slide.cta || ""} onChange={(cta) => updateSlide(index, { cta })} />
            <Field label="Arabic button" value={slide.ctaAr || ""} onChange={(ctaAr) => updateSlide(index, { ctaAr })} />
            <Field label="Link" value={slide.href || ""} onChange={(href) => updateSlide(index, { href })} />
            <Field label="Image description" value={slide.imageAlt || ""} onChange={(imageAlt) => updateSlide(index, { imageAlt })} />
            <label className="space-y-1 text-sm">
              <span className="font-medium">Layout</span>
              <select
                value={slide.layout || "stage"}
                onChange={(event) =>
                  updateSlide(index, {
                    layout: event.target.value as Slide["layout"],
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              >
                {layouts.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Image motion</span>
              <select
                value={slide.animation || "drift"}
                onChange={(event) =>
                  updateSlide(index, {
                    animation: event.target.value === "none" ? "none" : "drift",
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              >
                <option value="drift">Drift</option>
                <option value="none">None</option>
              </select>
            </label>
            <Field label="Starts" value={slide.startAt || ""} onChange={(startAt) => updateSlide(index, { startAt: startAt || null })} />
            <Field label="Ends" value={slide.endAt || ""} onChange={(endAt) => updateSlide(index, { endAt: endAt || null })} />
            <Field label="Desktop image" value={slide.desktopImage || ""} onChange={(desktopImage) => updateSlide(index, { desktopImage })} />
            <Field label="Mobile image" value={slide.mobileImage || ""} onChange={(mobileImage) => updateSlide(index, { mobileImage })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium">Upload desktop image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="mt-1 block w-full text-sm"
                onChange={(event) => {
                  const image = event.target.files?.[0];
                  if (image) void upload(index, "desktopImage", image);
                }}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium">Upload mobile image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="mt-1 block w-full text-sm"
                onChange={(event) => {
                  const image = event.target.files?.[0];
                  if (image) void upload(index, "mobileImage", image);
                }}
              />
            </label>
          </div>
        </section>
      ))}
    </div>
  );
}
