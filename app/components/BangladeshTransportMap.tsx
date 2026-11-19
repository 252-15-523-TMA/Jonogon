"use client";

import React, { useEffect, useRef, useState } from "react";
import { TransportRoute } from "../transport-data";
import {
  MapPin,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Maximize2,
  Navigation,
  Train,
  Bus,
  Compass,
} from "lucide-react";

interface Props {
  selectedRoute: TransportRoute;
  allRoutes: TransportRoute[];
  onSelectRoute: (routeId: string) => void;
  lang: "bn" | "en";
  darkMode: boolean;
}

export default function BangladeshTransportMap({
  selectedRoute,
  allRoutes,
  onSelectRoute,
  lang,
  darkMode,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapLayerType, setMapLayerType] = useState<"standard" | "satellite">("standard");
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Ensure Leaflet styles exist
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!isMounted || !mapContainerRef.current) return;

        // Center on Bangladesh (Dhaka default)
        const map = L.map(mapContainerRef.current, {
          center: [23.8103, 90.4125],
          zoom: 7,
          zoomControl: false,
          attributionControl: true,
        });

        // Default Tile layer (OpenStreetMap)
        const tileUrl =
          mapLayerType === "satellite"
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : darkMode
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when Dark Mode or Satellite changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      mapLayerType === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : darkMode
        ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current.setUrl(tileUrl);
  }, [darkMode, mapLayerType]);

  // Redraw Route and Markers when selectedRoute changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    async function drawRoute() {
      const L = (await import("leaflet")).default;
      const group = layerGroupRef.current;
      group.clearLayers();

      const colorMap: Record<string, string> = {
        metro: "#006A4E",
        train: "#D14949",
        bus: "#D97706",
        "intercity-bus": "#2563EB",
        launch: "#0D9488",
      };

      const routeColor = colorMap[selectedRoute.type] || "#006A4E";

      // 1. Draw Route Polyline
      if (selectedRoute.waypoints && selectedRoute.waypoints.length > 0) {
        const polyline = L.polyline(selectedRoute.waypoints, {
          color: routeColor,
          weight: 6,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(group);

        // Subtle glow layer underneath
        L.polyline(selectedRoute.waypoints, {
          color: routeColor,
          weight: 12,
          opacity: 0.25,
        }).addTo(group);

        // Fit map bounds to polyline
        const bounds = polyline.getBounds();
        mapInstanceRef.current.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          duration: 1.2,
        });
      }

      // 2. Add Station / Stoppage Markers
      selectedRoute.stations.forEach((station, index) => {
        const isStart = index === 0;
        const isEnd = index === selectedRoute.stations.length - 1;

        // Custom HTML Marker Icon
        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isStart || isEnd ? "26px" : "18px"};
            height: ${isStart || isEnd ? "26px" : "18px"};
            border-radius: 9999px;
            background-color: ${isStart ? "#006A4E" : isEnd ? "#D14949" : routeColor};
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            color: #FFFFFF;
            font-size: ${isStart || isEnd ? "11px" : "9px"};
            font-weight: bold;
          ">
            ${isStart ? "★" : isEnd ? "⚑" : index + 1}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-transport-marker",
          iconSize: [isStart || isEnd ? 26 : 18, isStart || isEnd ? 26 : 18],
          iconAnchor: [isStart || isEnd ? 13 : 9, isStart || isEnd ? 13 : 9],
        });

        const marker = L.marker([station.lat, station.lng], { icon: customIcon });

        marker.on("click", () => {
          setSelectedStation(station);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
            <div style="font-weight: 700; color: #18332A; margin-bottom: 3px;">
              ${lang === "bn" ? station.nameBn : station.nameEn}
            </div>
            ${station.departureTime ? `<div style="color: #006A4E; font-size: 11px; font-weight: 600;">🕒 ${lang === "bn" ? "সময়সূচি:" : "Time:"} ${station.departureTime}</div>` : ""}
            ${station.fareFromStartBn ? `<div style="color: #526B60; font-size: 11px;">💰 ${lang === "bn" ? "ভাড়া:" : "Fare:"} ${lang === "bn" ? station.fareFromStartBn : station.fareFromStartEn}</div>` : ""}
          </div>
        `);

        marker.addTo(group);
      });
    }

    drawRoute();
  }, [selectedRoute, lang]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    if (!mapInstanceRef.current || !selectedRoute.waypoints.length) return;
    async function reset() {
      const L = (await import("leaflet")).default;
      const bounds = L.latLngBounds(selectedRoute.waypoints);
      mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    }
    reset();
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border shadow-sm transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[440px] sm:h-[480px]"
      }`}
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Map Header Overlay Bar */}
      <div
        className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border backdrop-blur-md shadow-md"
        style={{
          backgroundColor: darkMode ? "rgba(25, 38, 34, 0.88)" : "rgba(255, 255, 255, 0.88)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            style={{
              backgroundColor: "var(--primary-green)",
              color: "#FFFFFF",
            }}
          >
            <Compass className="w-3.5 h-3.5" />
            {t("লাইভ রুট ম্যাপ", "Live Route Map")}
          </span>

          {/* Quick Route Selector Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {allRoutes.slice(0, 4).map((r) => {
              const active = r.id === selectedRoute.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRoute(r.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                    active ? "shadow-sm font-bold" : "opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: active ? "var(--primary-green-light)" : "transparent",
                    color: active ? "var(--primary-green)" : "var(--text-main)",
                    border: `1px solid ${active ? "var(--primary-green)" : "var(--border-color)"}`,
                  }}
                >
                  {r.type === "metro" ? "🚇 " : r.type === "train" ? "🚆 " : r.type === "launch" ? "⛴️ " : "🚌 "}
                  {lang === "bn" ? r.titleBn.split("(")[0] : r.titleEn.split("(")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Control Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Layer switcher */}
          <button
            onClick={() => setMapLayerType(mapLayerType === "standard" ? "satellite" : "standard")}
            className="p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
            title={t("স্যাটেলাইট / সাধারণ ম্যাপ বদলান", "Switch Satellite / Standard Map")}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">
              {mapLayerType === "standard" ? t("স্যাটেলাইট", "Satellite") : t("মানচিত্র", "Standard")}
            </span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleResetBounds}
            className="p-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
            title={t("রুটের মাঝে কেন্দ্র করুন", "Center on Route")}
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
            title={t("ফুলস্ক্রিন ম্যাপ", "Fullscreen Map")}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Google Maps External Navigation Button */}
          <a
            href={selectedRoute.googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#2563EB" }}
            title={t("গুগল ম্যাপে সরাসরি খুলুন", "Open in Google Maps")}
          >
            <Navigation className="w-3 h-3" />
            <span>Google Maps</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-[100]" />

      {/* Floating Zoom Buttons (Bottom Right) */}
      <div className="absolute bottom-5 right-3 z-[400] flex flex-col gap-1.5 shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg border transition-all hover:opacity-80 active:scale-95 shadow-sm"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-color)",
            color: "var(--text-main)",
          }}
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg border transition-all hover:opacity-80 active:scale-95 shadow-sm"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-color)",
            color: "var(--text-main)",
          }}
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Route Info Strip (Bottom Left Overlay) */}
      <div
        className="absolute bottom-4 left-3 max-w-[85%] sm:max-w-md z-[400] p-3 rounded-xl border backdrop-blur-md shadow-lg"
        style={{
          backgroundColor: darkMode ? "rgba(25, 38, 34, 0.92)" : "rgba(255, 255, 255, 0.92)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: "var(--primary-green)" }}
            />
            <span className="text-xs font-bold" style={{ color: "var(--text-main)" }}>
              {lang === "bn" ? selectedRoute.titleBn : selectedRoute.titleEn}
            </span>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: "var(--primary-green-light)",
              color: "var(--primary-green)",
            }}
          >
            {selectedRoute.distanceKm} km • {lang === "bn" ? selectedRoute.durationBn : selectedRoute.durationEn}
          </span>
        </div>
        <p className="text-[11px] line-clamp-1" style={{ color: "var(--text-muted)" }}>
          {lang === "bn" ? selectedRoute.routeSummaryBn : selectedRoute.routeSummaryEn}
        </p>

        {selectedStation && (
          <div
            className="mt-2 pt-2 border-t text-[11px] flex items-center justify-between gap-2"
            style={{ borderColor: "var(--border-color)" }}
          >
            <span className="font-semibold" style={{ color: "var(--primary-green)" }}>
              📍 {lang === "bn" ? selectedStation.nameBn : selectedStation.nameEn}
            </span>
            {selectedStation.fareFromStartBn && (
              <span className="text-[10px] font-bold" style={{ color: "var(--text-main)" }}>
                {t("ভাড়া:", "Fare:")} {lang === "bn" ? selectedStation.fareFromStartBn : selectedStation.fareFromStartEn}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
