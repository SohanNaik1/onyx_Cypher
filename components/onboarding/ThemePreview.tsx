import type { Theme } from "@/lib/themes";

const sample = [["Product one", "₹499"], ["Product two", "₹799"], ["Product three", "₹299"], ["Product four", "₹1,199"]];

export default function ThemePreview({ theme, storeName, logoUrl, categories }: {
  theme: Theme; storeName: string; logoUrl: string | null; categories: string[];
}) {
  const cols = theme.layout === "list" ? "grid-cols-1" : theme.layout === "compact" ? "grid-cols-3" : "grid-cols-2";
  return (
    <div aria-label={`Preview of the ${theme.name} theme`} className="overflow-hidden border" style={{ background: theme.bg, color: theme.text, fontFamily: theme.font, borderRadius: theme.radius }}>
      <div className="flex items-center gap-2 p-3" style={{ background: theme.surface }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logoUrl && <img src={logoUrl} alt="" className="h-6 w-6 object-contain" />}
        <strong className="truncate text-sm">{storeName || "Your Store"}</strong>
      </div>
      <div className="p-4" style={{ background: theme.accent, color: theme.accentText }}>
        <p className={`font-bold ${theme.layout === "editorial" ? "text-2xl" : "text-lg"}`}>New arrivals</p>
        <p className="text-xs opacity-90">Fresh picks from {categories[0] ?? "our collection"}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto p-3">
        {(categories.length ? categories : ["All"]).slice(0, 4).map((c) => (
          <span key={c} className="shrink-0 px-3 py-1 text-xs" style={{ background: theme.surface, borderRadius: theme.radius }}>{c}</span>
        ))}
      </div>
      <div className={`grid gap-2 p-3 ${cols}`}>
        {sample.slice(0, theme.layout === "compact" ? 3 : 4).map(([n, p]) => (
          <div key={n} className="p-2" style={{ background: theme.surface, borderRadius: theme.radius }}>
            <div className="mb-2 aspect-square" style={{ background: theme.bg, borderRadius: theme.radius }} />
            <p className="text-xs font-medium">{n}</p>
            <p className="text-xs opacity-80">{p}</p>
            <span className="mt-1 inline-block px-2 py-0.5 text-[10px]" style={{ background: theme.accent, color: theme.accentText, borderRadius: theme.radius }}>Add</span>
          </div>
        ))}
      </div>
    </div>
  );
}
