"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Compass,
  Eye,
  FileCheck,
  FileText,
  Globe2,
  HeartHandshake,
  Lock,
  MapPin,
  Navigation,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { PublicServiceSearchItem } from "./PublicServiceSearch";

type Language = "bn" | "en";

const ARTWORK: Record<string, { icon: LucideIcon; colors: [string, string]; glow: string }> = {
  "feature-transport": { icon: Navigation, colors: ["#DDF5F0", "#A6DDD0"], glow: "#006A4E" },
  "feature-civic-signal": { icon: AlertTriangle, colors: ["#FFF0D7", "#F6D19A"], glow: "#B86C12" },
  "feature-bazaar": { icon: TrendingUp, colors: ["#E4F5E7", "#B3DDB8"], glow: "#328448" },
  "feature-whistleblower": { icon: Lock, colors: ["#EAE7F9", "#C7BDEB"], glow: "#6553A8" },
  "feature-rumor": { icon: Eye, colors: ["#E1F0FB", "#ADD5EE"], glow: "#2875A7" },
  "feature-nrb": { icon: Globe2, colors: ["#DDF3F5", "#A6D8DE"], glow: "#177783" },
  "feature-fees": { icon: Calculator, colors: ["#F0EAFB", "#D1C3EF"], glow: "#7555A8" },
  "feature-doc-checker": { icon: FileCheck, colors: ["#E5F3E8", "#B8DEBE"], glow: "#387B4B" },
  "feature-scam": { icon: ShieldAlert, colors: ["#FCE7E5", "#F1BDB7"], glow: "#B8473D" },
  "feature-volunteer": { icon: HeartHandshake, colors: ["#FBE8EE", "#EFC0D0"], glow: "#A84062" },
  "feature-grievance": { icon: Building2, colors: ["#E6EDF7", "#BDCEE4"], glow: "#466B98" },
  "feature-marriage": { icon: CheckCircle2, colors: ["#F9E8EF", "#EABDD0"], glow: "#A5466C" },
  "feature-lost-doc": { icon: FileText, colors: ["#E6EFF8", "#C2D5E8"], glow: "#476F9B" },
  "feature-mismatch": { icon: Search, colors: ["#E8F0FA", "#BED1E9"], glow: "#3E6794" },
  "feature-rejection": { icon: AlertTriangle, colors: ["#FCE9E5", "#F0C0B6"], glow: "#B94E3E" },
  "birth-registration": { icon: FileText, colors: ["#E7F4EC", "#B8DDC6"], glow: "#337C4C" },
  passport: { icon: Globe2, colors: ["#E4F1FA", "#B6D4E9"], glow: "#37739B" },
  nid: { icon: ShieldCheck, colors: ["#E7F0FB", "#B8CEE8"], glow: "#426D9A" },
  "driving-license": { icon: Compass, colors: ["#FFF0DB", "#F2D0A1"], glow: "#AE6C19" },
  "land-records": { icon: MapPin, colors: ["#E8F4E5", "#BEDDB6"], glow: "#4A8141" },
  "police-clearance": { icon: ShieldCheck, colors: ["#E6EDF8", "#C0CFE4"], glow: "#4A6791" },
  "tax-services": { icon: Calculator, colors: ["#F1EBF9", "#D2C4E8"], glow: "#74599E" },
};

export default function ServiceFeatureCarousel({
  lang,
  items,
  onSelect,
}: {
  lang: Language;
  items: PublicServiceSearchItem[];
  onSelect: (item: PublicServiceSearchItem) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(items.length);
  const resetTimerRef = useRef<number | null>(null);
  const hoverExitTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(items.length);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animateTrack, setAnimateTrack] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    if (hoverExitTimerRef.current !== null) window.clearTimeout(hoverExitTimerRef.current);
  }, []);

  const moveBy = useCallback((direction: number) => {
    if (items.length <= 1) return;
    const end = items.length * 2;
    const next = Math.max(0, Math.min(end, indexRef.current + direction));
    if (next === indexRef.current) return;

    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    indexRef.current = next;
    setActiveIndex(next);

    if (next === 0 || next === end) {
      resetTimerRef.current = window.setTimeout(() => {
        setAnimateTrack(false);
        indexRef.current = items.length;
        setActiveIndex(items.length);
        window.setTimeout(() => setAnimateTrack(true), 30);
      }, 760);
    }
  }, [items.length]);

  const handleCardPointerEnter = useCallback(() => {
    if (hoverExitTimerRef.current !== null) {
      window.clearTimeout(hoverExitTimerRef.current);
      hoverExitTimerRef.current = null;
    }
    setIsCardHovered(true);
  }, []);

  const handleCardPointerLeave = useCallback(() => {
    if (hoverExitTimerRef.current !== null) window.clearTimeout(hoverExitTimerRef.current);
    hoverExitTimerRef.current = window.setTimeout(() => {
      setIsCardHovered(false);
      moveBy(1);
      hoverExitTimerRef.current = null;
    }, 120);
  }, [moveBy]);

  useEffect(() => {
    if (items.length <= 1 || isCardHovered || reducedMotion) return;
    const timer = window.setInterval(() => moveBy(1), 3_200);
    return () => window.clearInterval(timer);
  }, [isCardHovered, items.length, moveBy, reducedMotion]);

  const gap = viewportWidth > 700 ? 16 : 10;
  const visibleCount = viewportWidth > 700 ? 5 : 3;
  const cardWidth = viewportWidth > 0
    ? Math.max(86, Math.min(viewportWidth > 700 ? 210 : 138, (viewportWidth - gap * (visibleCount - 1)) / visibleCount))
    : 120;
  const translateX = viewportWidth > 0
    ? viewportWidth / 2 - cardWidth / 2 - activeIndex * (cardWidth + gap)
    : 0;
  const extendedItems = [...items, ...items, ...items];

  return (
    <section
      className="mt-7 w-full max-w-5xl"
      aria-label={lang === "bn" ? "নাগরিক সেবা ও ফিচার ক্যারোসেল" : "Citizen services and features carousel"}
      aria-roledescription="carousel"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1 text-left">
        <div className="min-w-0">
          <h2 className="text-sm font-bold sm:text-base" style={{ color: "var(--text-main)" }}>
            {lang === "bn" ? "সেবা ও ফিচার ঘুরে দেখুন" : "Explore services and features"}
          </h2>
          <p className="mt-0.5 text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
            {lang === "bn" ? "কার্ড নির্বাচন করে বিস্তারিত খুলুন" : "Select a card to open its guide"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => moveBy(-1)}
            className="grid h-8 w-8 place-items-center rounded-full border transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            aria-label={lang === "bn" ? "আগের সেবা বা ফিচার" : "Previous service or feature"}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => moveBy(1)}
            className="grid h-8 w-8 place-items-center rounded-full border transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
            aria-label={lang === "bn" ? "পরের সেবা বা ফিচার" : "Next service or feature"}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="overflow-hidden py-2" aria-live="off">
        <div
          className="flex items-stretch"
          style={{
            gap,
            opacity: viewportWidth > 0 ? 1 : 0,
            transform: `translateX(${translateX}px)`,
            transition: animateTrack && !reducedMotion ? "transform 720ms cubic-bezier(0.22, 0.7, 0.24, 1), opacity 180ms ease" : "none",
          }}
        >
          {extendedItems.map((item, renderIndex) => {
            const distance = renderIndex - activeIndex;
            const absoluteDistance = Math.abs(distance);
            const itemKey = item.serviceId ?? item.id;
            const artwork = ARTWORK[itemKey] ?? ARTWORK[item.id] ?? { icon: Sparkles, colors: ["#E3F1ED", "#B6D8CD"] as [string, string], glow: "#006A4E" };
            const ArtworkIcon = artwork.icon;
            const isService = Boolean(item.serviceId && item.id === `service-${item.serviceId}`);
            const title = lang === "bn" ? item.titleBn : item.titleEn;
            const sideOpacity = absoluteDistance === 0 ? 1 : absoluteDistance === 1 ? 0.58 : 0.2;

            return (
              <button
                key={`${item.id}-${renderIndex}`}
                type="button"
                onClick={() => onSelect(item)}
                className="service-feature-card relative flex aspect-square shrink-0 flex-col rounded-[1.35rem] border p-2 text-left shadow-sm focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 sm:rounded-[1.6rem] sm:p-2.5"
                style={{
                  width: cardWidth,
                  opacity: sideOpacity,
                  filter: absoluteDistance === 0 ? "none" : absoluteDistance === 1 ? "blur(1px)" : "blur(2.6px)",
                  transform: `scale(${absoluteDistance === 0 ? 1 : absoluteDistance === 1 ? 0.92 : 0.84})`,
                  zIndex: 10 - absoluteDistance,
                  borderColor: absoluteDistance === 0 ? "var(--primary-green)" : "var(--border-color)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text-main)",
                  boxShadow: absoluteDistance === 0 ? "0 12px 30px rgba(0, 72, 53, 0.16)" : undefined,
                }}
                aria-label={`${lang === "bn" ? "খুলুন" : "Open"}: ${title}`}
                tabIndex={absoluteDistance <= (visibleCount === 5 ? 2 : 1) ? 0 : -1}
                onPointerEnter={handleCardPointerEnter}
                onPointerLeave={handleCardPointerLeave}
              >
                <span
                  role="img"
                  aria-label={title}
                  className="relative mb-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1rem]"
                  style={{ background: `linear-gradient(145deg, ${artwork.colors[0]}, ${artwork.colors[1]})` }}
                >
                  <svg aria-hidden="true" viewBox="0 0 180 120" className="absolute inset-0 h-full w-full">
                    <circle cx="145" cy="20" r="39" fill={artwork.glow} opacity=".11" />
                    <circle cx="35" cy="105" r="48" fill="white" opacity=".34" />
                    <path d="M0 94C36 76 58 115 91 94s49-14 89-31v57H0z" fill={artwork.glow} opacity=".09" />
                    <path d="M0 0h180v120H0z" fill="none" stroke="white" strokeOpacity=".4" strokeWidth="2" />
                  </svg>
                  <span className="relative grid h-[3.25rem] w-[3.25rem] place-items-center rounded-[1.15rem] border border-white/65 bg-white/65 shadow-sm backdrop-blur-sm sm:h-[3.8rem] sm:w-[3.8rem]">
                    <ArtworkIcon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.8} style={{ color: artwork.glow }} />
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-full border border-white/60 bg-white/55 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.13em]" style={{ color: artwork.glow }}>
                    {isService ? (lang === "bn" ? "সেবা" : "Service") : (lang === "bn" ? "ফিচার" : "Feature")}
                  </span>
                </span>
                <span className="line-clamp-2 min-h-[2.5em] px-0.5 text-center text-[10px] font-bold leading-[1.25] sm:text-xs">
                  {title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
