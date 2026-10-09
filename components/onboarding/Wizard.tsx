"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Field, { inputCls } from "@/components/Field";
import { defaultCategories, businessTypes } from "@/lib/categories";
import { themes } from "@/lib/themes";
import { Details, Errors, slugify, validateDetails } from "@/lib/validation";
import ThemePreview from "./ThemePreview";

const steps = ["Store", "Categories", "Products", "Theme"] as const;
type ProductMode = "dummy" | "csv";

const btnPrimary = "min-h-11 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/40 disabled:opacity-50";
const btnGhost = "min-h-11 rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600/30";

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({
    storeName: "", businessType: "", email: "", phone: "", address: "", city: "", pincode: "", logo: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [catError, setCatError] = useState("");
  const [mode, setMode] = useState<ProductMode>("dummy");
  const [csv, setCsv] = useState<File | null>(null);
  const [prodError, setProdError] = useState("");
  const [themeId, setThemeId] = useState(themes[0].id);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [submitError, setSubmitError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const logoUrl = useMemo(() => (details.logo ? URL.createObjectURL(details.logo) : null), [details.logo]);
  useEffect(() => () => { if (logoUrl) URL.revokeObjectURL(logoUrl); }, [logoUrl]);
  useEffect(() => { headingRef.current?.focus(); }, [step, status]);

  const slug = slugify(details.storeName);
  const set = <K extends keyof Details>(k: K, v: Details[K]) => setDetails((d) => ({ ...d, [k]: v }));

  function next() {
    if (step === 0) {
      const e = validateDetails(details);
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    if (step === 1 && categories.length === 0) { setCatError("Pick at least one category"); return; }
    if (step === 2 && mode === "csv" && !csv) { setProdError("Choose a CSV or Excel file, or switch to sample products"); return; }
    setStep((s) => s + 1);
  }

  function toggleCat(c: string) {
    setCatError("");
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  }
  function addCustom() {
    const c = custom.trim();
    if (c.length < 2) return;
    if (!categories.some((x) => x.toLowerCase() === c.toLowerCase())) setCategories((cs) => [...cs, c]);
    setCustom(""); setCatError("");
  }

  async function launch() {
    setStatus("loading"); setSubmitError("");
    try {
      // TODO: replace with real API call (POST /api/stores) once backend schema is ready
      await new Promise((r) => setTimeout(r, 1200));
      setStatus("done");
    } catch {
      setSubmitError("Something went wrong while creating your store. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-10">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-green-900 outline-none">Your store is live!</h2>
        <p className="mt-2 text-green-900">{details.storeName} is ready at</p>
        <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm">/s/{slug}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={`/s/${slug}`} className={btnPrimary + " text-center"}>View store</a>
          <a href="/admin" className={btnGhost + " text-center"}>Open admin panel</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="text-center">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-gray-200"}`} />
            <span className={`mt-1 block text-xs sm:text-sm ${i === step ? "font-semibold text-gray-900" : "text-gray-500"}`}>
              <span className="sr-only">Step {i + 1}: </span>{s}
            </span>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
        <h2 ref={headingRef} tabIndex={-1} className="mb-1 text-xl font-semibold outline-none sm:text-2xl">
          {["Tell us about your store", "What will you sell?", "Add your products", "Pick a look"][step]}
        </h2>
        <p className="mb-6 text-sm text-gray-600">Step {step + 1} of {steps.length}</p>

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Store name" error={errors.storeName} hint={slug ? `Your store address: /s/${slug}` : undefined}>
                {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} className={inputCls} value={details.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="e.g. Kaveri Crafts" autoComplete="organization" />}
              </Field>
            </div>
            <Field label="Business type" error={errors.businessType}>
              {(p) => (
                <select id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} className={inputCls} value={details.businessType} onChange={(e) => set("businessType", e.target.value)}>
                  <option value="">Select…</option>
                  {businessTypes.map((b) => <option key={b}>{b}</option>)}
                </select>
              )}
            </Field>
            <Field label="Logo (optional)" error={errors.logo} hint="PNG, JPG, WebP or SVG, up to 2 MB">
              {(p) => (
                <div className="flex items-center gap-3">
                  {logoUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="Your logo preview" className="h-11 w-11 rounded-lg border object-contain" />}
                  <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} type="file" accept="image/*" className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:font-medium" onChange={(e) => set("logo", e.target.files?.[0] ?? null)} />
                </div>
              )}
            </Field>
            <Field label="Email" error={errors.email}>
              {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} type="email" className={inputCls} value={details.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />}
            </Field>
            <Field label="Phone" error={errors.phone}>
              {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} type="tel" inputMode="numeric" maxLength={10} className={inputCls} value={details.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} autoComplete="tel-national" />}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" error={errors.address}>
                {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} className={inputCls} value={details.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />}
              </Field>
            </div>
            <Field label="City" error={errors.city}>
              {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} className={inputCls} value={details.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />}
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              {(p) => <input id={p.id} aria-describedby={p.describedBy} aria-invalid={p.invalid} inputMode="numeric" maxLength={6} className={inputCls} value={details.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} autoComplete="postal-code" />}
            </Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <div role="group" aria-label="Categories" className="flex flex-wrap gap-2">
              {[...defaultCategories, ...categories.filter((c) => !defaultCategories.includes(c))].map((c) => {
                const on = categories.includes(c);
                return (
                  <button key={c} type="button" aria-pressed={on} onClick={() => toggleCat(c)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/40 ${on ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}>
                    {on && "✓ "}{c}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <div className="flex-1">
                <Field label="Add a custom category">
                  {(p) => <input id={p.id} className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="e.g. Organic spices" />}
                </Field>
              </div>
              <button type="button" onClick={addCustom} className={btnGhost + " self-end"}>Add</button>
            </div>
            {catError && <p role="alert" className="mt-3 text-sm text-red-700">{catError}</p>}
            <p className="mt-3 text-sm text-gray-500">{categories.length} selected</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <div role="radiogroup" aria-label="How to add products" className="grid gap-3 sm:grid-cols-2">
              {([
                ["dummy", "Import sample products", `We'll fill your store with realistic products for ${categories.length} categor${categories.length === 1 ? "y" : "ies"}.`],
                ["csv", "Upload Excel / CSV", "Bring your own product sheet. You'll map columns and review errors next."],
              ] as const).map(([val, title, desc]) => (
                <label key={val} className={`cursor-pointer rounded-xl border p-4 focus-within:ring-2 focus-within:ring-blue-600/40 ${mode === val ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
                  <input type="radio" name="mode" className="sr-only" checked={mode === val} onChange={() => { setMode(val); setProdError(""); }} />
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-gray-600">{desc}</span>
                </label>
              ))}
            </div>
            {mode === "csv" && (
              <div className="mt-4">
                <Field label="Product file" hint="CSV or Excel (.xlsx). Column mapping and preview come after upload.">
                  {(p) => <input id={p.id} aria-describedby={p.describedBy} type="file" accept=".csv,.xlsx,.xls" className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:font-medium" onChange={(e) => { setCsv(e.target.files?.[0] ?? null); setProdError(""); }} />}
                </Field>
              </div>
            )}
            {prodError && <p role="alert" className="mt-3 text-sm text-red-700">{prodError}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div role="radiogroup" aria-label="Theme" className="grid gap-2">
              {themes.map((t) => (
                <label key={t.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 focus-within:ring-2 focus-within:ring-blue-600/40 ${themeId === t.id ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
                  <input type="radio" name="theme" className="sr-only" checked={themeId === t.id} onChange={() => setThemeId(t.id)} />
                  <span className="h-8 w-8 shrink-0 rounded-full border" style={{ background: t.accent }} aria-hidden />
                  <span><span className="block font-medium">{t.name}</span><span className="block text-sm text-gray-600">{t.blurb}</span></span>
                </label>
              ))}
            </div>
            <ThemePreview theme={themes.find((t) => t.id === themeId)!} storeName={details.storeName} logoUrl={logoUrl} categories={categories} />
          </div>
        )}

        {status === "error" && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{submitError}</p>}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" className={btnGhost} onClick={() => setStep((s) => s - 1)} disabled={step === 0 || status === "loading"} style={{ visibility: step === 0 ? "hidden" : "visible" }}>Back</button>
          {step < 3 ? (
            <button type="button" className={btnPrimary} onClick={next}>Continue</button>
          ) : (
            <button type="button" className={btnPrimary} onClick={launch} disabled={status === "loading"}>
              {status === "loading" ? "Creating your store…" : status === "error" ? "Try again" : "Launch my store"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
