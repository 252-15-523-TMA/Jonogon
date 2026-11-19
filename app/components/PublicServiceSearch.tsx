"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

export type PublicServiceSearchItem = {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  keywords: string;
  page?: string;
  serviceId?: string;
  href?: string;
};

type Language = "bn" | "en";

export default function PublicServiceSearch({
  lang,
  items,
  onClose,
  onSelect,
}: {
  lang: Language;
  items: PublicServiceSearchItem[];
  onClose: () => void;
  onSelect: (item: PublicServiceSearchItem) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = (bn: string, en: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) {
      const popularIds = ["service-birth-registration", "service-passport", "service-nid", "service-driving-license", "service-land-records", "feature-grievance"];
      const popular = popularIds.map((id) => items.find((item) => item.id === id)).filter((item): item is PublicServiceSearchItem => Boolean(item));
      return [...popular, ...items.filter((item) => !popularIds.includes(item.id))].slice(0, 8);
    }
    return items
      .map((item) => {
        const title = (lang === "bn" ? item.titleBn : item.titleEn).toLocaleLowerCase();
        const otherTitle = (lang === "bn" ? item.titleEn : item.titleBn).toLocaleLowerCase();
        const titleStarts = title.startsWith(normalized) || otherTitle.startsWith(normalized);
        const wordStarts = `${title} ${otherTitle}`.split(/\s+/).some((word) => word.startsWith(normalized));
        const titleContains = title.includes(normalized) || otherTitle.includes(normalized);
        const broadContains = `${item.descriptionBn} ${item.descriptionEn} ${item.keywords}`.toLocaleLowerCase().includes(normalized);
        const score = titleStarts ? 0 : wordStarts ? 1 : titleContains ? 2 : broadContains ? 3 : 99;
        return { item, score };
      })
      .filter((result) => result.score < 99)
      .sort((a, b) => a.score - b.score || a.item.titleEn.localeCompare(b.item.titleEn))
      .map((result) => result.item);
  }, [items, lang, query]);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/45 px-3 pt-16 backdrop-blur-sm sm:px-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="public-service-search-title" className="mx-auto max-h-[min(78vh,680px)] max-w-2xl overflow-hidden rounded-2xl border shadow-2xl" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
        <h2 id="public-service-search-title" className="sr-only">{t("সরকারি সেবা খুঁজুন", "Search public services")}</h2>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
          <Search className="h-5 w-5 shrink-0" style={{ color: "var(--primary-green)" }} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}
            placeholder={t("যেকোনো সরকারি সেবা খুঁজুন", "Search any public service")}
            aria-label={t("যেকোনো সরকারি সেবা খুঁজুন", "Search any public service")}
            aria-autocomplete="list"
            aria-controls="public-service-search-results"
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none"
            style={{ color: "var(--text-main)" }}
          />
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-black/5 dark:hover:bg-white/5" aria-label={t("বন্ধ করুন", "Close search")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(min(78vh,680px)-64px)] overflow-y-auto p-2">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            {query.trim() ? t(`${results.length}টি মিলে যাওয়া বিকল্প`, `${results.length} matching options`) : t("জনপ্রিয় সেবা", "Popular services")}
          </p>
          {results.length ? (
            <ul id="public-service-search-results" role="listbox" className="space-y-1">
              {results.map((item, index) => (
                <li key={item.id} role="presentation">
                  <button type="button" role="option" aria-selected="false" onClick={() => onSelect(item)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] dark:hover:bg-white/5" style={{ color: "var(--text-main)" }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}><Search className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{lang === "bn" ? item.titleBn : item.titleEn}</span>
                      <span className="mt-0.5 block line-clamp-1 text-xs" style={{ color: "var(--text-muted)" }}>{lang === "bn" ? item.descriptionBn : item.descriptionEn}</span>
                    </span>
                    <span className="sr-only">{index + 1}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" style={{ color: "var(--primary-green)" }} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>{t("এই শব্দের সঙ্গে মেলে এমন সেবা পাওয়া যায়নি। অন্যভাবে লিখে দেখুন।", "No services match that search. Try another term.")}</p>
          )}
        </div>
        <div className="border-t px-4 py-2 text-[10px]" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          {t("শুরুতে মিলে যাওয়া নামগুলো আগে দেখানো হয়; নাম ও বিবরণের মধ্যেও খোঁজা হয়।", "Name matches appear first; titles and descriptions are searched.")}
        </div>
      </section>
    </div>
  );
}
