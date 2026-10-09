export type Theme = {
  id: string;
  name: string;
  blurb: string;
  bg: string;
  surface: string;
  text: string;
  accent: string;
  accentText: string;
  font: string;
  radius: string;
  layout: "grid" | "list" | "editorial" | "compact";
};

export const themes: Theme[] = [
  { id: "classic", name: "Classic", blurb: "Clean white, blue accent", bg: "#ffffff", surface: "#f3f4f6", text: "#111827", accent: "#2563eb", accentText: "#ffffff", font: "ui-sans-serif, system-ui, sans-serif", radius: "8px", layout: "grid" },
  { id: "midnight", name: "Midnight", blurb: "Dark, bold, modern", bg: "#0f172a", surface: "#1e293b", text: "#f1f5f9", accent: "#38bdf8", accentText: "#0f172a", font: "ui-sans-serif, system-ui, sans-serif", radius: "14px", layout: "compact" },
  { id: "boutique", name: "Boutique", blurb: "Soft, elegant serif", bg: "#fdf8f4", surface: "#f5e9df", text: "#3b2a20", accent: "#b45309", accentText: "#ffffff", font: "Georgia, 'Times New Roman', serif", radius: "2px", layout: "editorial" },
  { id: "fresh", name: "Fresh", blurb: "Bright, friendly, rounded", bg: "#f0fdf4", surface: "#dcfce7", text: "#14532d", accent: "#16a34a", accentText: "#ffffff", font: "ui-rounded, system-ui, sans-serif", radius: "20px", layout: "list" },
];
