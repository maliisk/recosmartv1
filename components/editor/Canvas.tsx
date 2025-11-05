"use client";

import { DEVICES, DeviceKey } from "@/lib/devices";
import { ChevronLeft, ChevronRight, Minus, Plus, Pointer } from "lucide-react";
import { useEditor } from "./EditorContext";
import { mockProducts } from "@/data/mockProducts";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const cssEscape = (s: string) =>
  s.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");

function uniqueSelector(el: Element): string {
  const he = el as HTMLElement;
  if (he.id) return `#${cssEscape(he.id)}`;
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && parts.length < 6) {
    const tag = cur.tagName.toLowerCase();
    const id = (cur as HTMLElement).id;
    if (id) {
      parts.unshift(`${tag}#${cssEscape(id)}`);
      break;
    }
    const cls =
      (cur as HTMLElement).className?.toString()?.split(/\s+/)[0] || "";
    const parent: Element | null = cur.parentElement;
    if (parent) {
      const idx = Array.from(parent.children).indexOf(cur) + 1;
      parts.unshift(
        `${tag}${cls ? "." + cssEscape(cls) : ""}:nth-child(${idx})`
      );
      cur = parent;
    } else {
      parts.unshift(tag);
      break;
    }
  }
  return parts.join(" > ");
}

type Theme = {
  accent: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  text: string;
  price: string;
  radius: number | string;
  shadow: string;
  dot: string;
  arrowBg: string;
  badgeBg: string;
  badgeColor: string;
  fontFamily?: string;
};

const defaultTheme: Theme = {
  accent: "#111827",
  cardBg: "#ffffff",
  cardBorder: "rgba(0,0,0,.06)",
  titleColor: "#1f2937",
  text: "#374151",
  price: "#111827",
  radius: 12,
  shadow: "0 10px 30px rgba(0,0,0,.08)",
  dot: "#d1d5db",
  arrowBg: "#ffffff",
  badgeBg: "rgba(0,0,0,.8)",
  badgeColor: "#ffffff",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
};

const toPx = (v: number | string) =>
  typeof v === "number" ? `${v}px` : /\dpx$/.test(v) ? v : `${v}px`;

const themeVars = (t: Theme) => `
:host, .rs-scope{
  --rs-accent:${t.accent};
  --rs-card-bg:${t.cardBg};
  --rs-card-border:${t.cardBorder};
  --rs-title:${t.titleColor};
  --rs-text:${t.text};
  --rs-price:${t.price};
  --rs-radius:${toPx(t.radius)};
  --rs-shadow:${t.shadow};
  --rs-dot:${t.dot};
  --rs-arrow-bg:${t.arrowBg};
  --rs-badge-bg:${t.badgeBg};
  --rs-badge-color:${t.badgeColor};
  --rs-font:${t.fontFamily ?? defaultTheme.fontFamily};
}
`;

const WIDGET_CSS = `
:host {
  all: initial;
  display:block;
  margin:24px 0; /* varsayılan üst-alt boşluk */
  font-family: var(--rs-font, var(--reco-font, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"));
  color: var(--rs-text, var(--reco-text, #111));
}

.rs-wrap {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  background: var(--rs-card-bg, var(--reco-card-bg, #ffffff));
  border-radius: var(--rs-radius, var(--reco-radius, 16px));
  padding: 24px;
  box-shadow: var(--rs-shadow, var(--reco-shadow, 0 10px 30px rgba(0,0,0,.08)));
}

.rs-title {
  font-weight: 600;
  font-size: 20px;
  margin: 0 0 16px;
  color: var(--rs-title, var(--reco-title, #1f2937));
}

.rs-slider { position: relative; overflow: hidden; }
.rs-track  { display: flex; gap: 20px; will-change: transform; transition: transform .3s ease; }
.rs-item   { flex: 0 0 auto; }

.rs-card {
  overflow: hidden;
  border-radius: calc(var(--rs-radius, var(--reco-radius, 16px)) - 4px);
  border: 1px solid var(--rs-card-border, var(--reco-card-border, rgba(0,0,0,.06)));
  background: var(--rs-card-bg, var(--reco-card-bg, #ffffff));
}

.rs-img { position: relative; width: 100%; padding-top: 133.333%; background: #f7f7f7; }
.rs-img > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

.rs-badge {
  position: absolute; left: 8px; top: 8px;
  background: var(--rs-badge-bg, var(--reco-badge-bg, rgba(0,0,0,.8)));
  color: var(--rs-badge-color, var(--reco-badge-color, #ffffff));
  font-size: 12px; padding: 4px 8px; border-radius: 6px; outline: none;
}
.rs-badge[contenteditable="true"] { box-shadow: 0 0 0 2px rgba(37,99,235,.35); }

.rs-body   { padding: 12px; }
.rs-title2 { font-size: 14px; color: var(--rs-text, var(--reco-text, #374151)); line-height: 1.35; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin: 0; }
.rs-price  { margin: 8px 0 0; font-weight: 600; color: var(--rs-price, var(--reco-price, #111827)); }

.rs-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: var(--rs-arrow-bg, var(--reco-arrow-bg, #ffffff));
  border-radius: 999px; padding: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,.12); border: none;
  cursor: pointer; z-index: 50; pointer-events: auto;
}
.rs-arrow:hover { box-shadow: 0 6px 18px rgba(0,0,0,.16); }
.rs-arrow:focus-visible { outline: 2px solid var(--rs-accent, var(--reco-accent, #111827)); outline-offset: 2px; }
.rs-prev { left: 6px; }
.rs-next { right: 6px; }

.rs-bullets { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px; }
.rs-dot { width:8px; height:8px; border-radius:999px; background:var(--rs-dot, var(--reco-dot, #d1d5db)); border:none; cursor:pointer; }
.rs-dot.is-active { background:var(--rs-accent, var(--reco-accent, #111827)); }
`;

const WIDGET_CSS_EDIT = (theme: Theme) =>
  `${themeVars(theme).replace(":host, ", "")}\n` +
  WIDGET_CSS.replace(":host", ".rs-scope");

type AnchorMode = "before" | "after" | "append";

export default function Canvas({ device }: { device: DeviceKey }) {
  const viewWidth = DEVICES[device].width;
  const viewHeight = DEVICES[device].height || 0;

  const editor = useEditor() as ReturnType<typeof useEditor> & {
    anchorSelector?: string;
    setAnchorSelector?: (v: string) => void;
    anchorMode?: AnchorMode;
    badgeMap: Record<string, string>;
    setBadgeText?: (id: string, text: string) => void;
    theme?: Partial<Theme>;
    setTheme?: (t: Partial<Theme>) => void;
  };

  const {
    products,
    productCount,
    showImage,
    showTitle,
    showBadge,
    showLeftArrow,
    showRightArrow,
    showBullets,
    previewUrl,
    showPreview,
    badgeMap,
  } = editor;

  const [localTheme, setLocalTheme] = useState<Theme>({
    ...defaultTheme,
    ...(editor.theme ?? {}),
  });
  useEffect(() => {
    if (editor.theme) setLocalTheme((p) => ({ ...p, ...editor.theme! }));
  }, [editor.theme]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Partial<Theme>>).detail || {};
      setLocalTheme((prev) => {
        let changed = false;
        const next: Theme = { ...prev };
        (Object.keys(detail) as (keyof Theme)[]).forEach((k) => {
          const v = detail[k];
          if (v !== undefined && prev[k] !== v) {
            (next as any)[k] = v;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };
    window.addEventListener("reco-theme-change", handler as EventListener);
    return () =>
      window.removeEventListener("reco-theme-change", handler as EventListener);
  }, []);

  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    if (!shadowRoot) return;
    const first = shadowRoot.firstChild as HTMLStyleElement | null;
    if (first && first.tagName === "STYLE") {
      first.textContent = themeVars(localTheme);
    }
  }, [localTheme, shadowRoot]);

  const [anchorSelectorLocal, setAnchorSelectorLocal] = useState("");
  const setAnchorSelector = editor.setAnchorSelector ?? setAnchorSelectorLocal;
  const anchorSelector = editor.anchorSelector ?? anchorSelectorLocal;
  const anchorMode: AnchorMode = "after";

  const list = useMemo(
    () => (products.length ? products : mockProducts).slice(0, productCount),
    [products, productCount]
  );
  const perView = device === "desktop" ? 4 : device === "tablet" ? 3 : 2;
  const pageCount = Math.max(1, Math.ceil(list.length / perView));
  const [page, setPage] = useState(0);
  const next = () => setPage((p) => Math.min(pageCount - 1, p + 1));
  const prev = () => setPage((p) => Math.max(0, p - 1));
  useEffect(() => setPage(0), [list.length, perView]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const isSpace = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpace.current = true;
    };
    const ku = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpace.current = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (showPreview) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left - pan.x) / scale;
      const ny = (e.clientY - rect.top - pan.y) / scale;
      const ns = Math.min(2, Math.max(0.5, scale * (1 + -e.deltaY / 1000)));
      setScale(ns);
      setPan({
        x: e.clientX - rect.left - nx * ns,
        y: e.clientY - rect.top - ny * ns,
      });
    };
    const md = (e: MouseEvent) => {
      if (showPreview || !isSpace.current) return;
      last.current = { x: e.clientX, y: e.clientY };
      setPanning(true);
      document.body.style.cursor = "grabbing";
    };
    const mm = (e: MouseEvent) => {
      if (!panning || !last.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    };
    const mu = () => {
      if (!panning) return;
      setPanning(false);
      last.current = null;
      document.body.style.cursor = "";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [panning, scale, pan, showPreview]);

  const zoomOut = () => setScale((s) => Math.max(0.5, s * 0.9));
  const zoomIn = () => setScale((s) => Math.min(2, s * 1.1));

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [docReady, setDocReady] = useState(false);

  // ---- NAVİGASYON KÖPRÜSÜ: currentUrl state'i ve postMessage dinleyicisi
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // preview açıldığında başlangıç URL'i
  useEffect(() => {
    if (showPreview && previewUrl) {
      setShadowRoot(null);
      setDocReady(false);
      setCurrentUrl(previewUrl);
    }
  }, [showPreview, previewUrl]);

  // iframe içinden gelen RECO_NAV mesajlarını yakala
  useEffect(() => {
    if (!showPreview) return;
    const onMsg = (e: MessageEvent) => {
      const d = e?.data;
      if (!d || d.type !== "RECO_NAV" || !d.url) return;
      setShadowRoot(null);
      setDocReady(false);
      setCurrentUrl(d.url as string);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [showPreview]);

  // ---- iFrame: daima proxy üzerinden yükle (currentUrl bazlı)
  const proxySrc =
    showPreview && currentUrl
      ? `/api/proxy?url=${encodeURIComponent(currentUrl)}`
      : undefined;

  // Pick modu tıklama dinleyicisi ve load
  useEffect(() => {
    const ifr = iframeRef.current;
    if (!ifr) return;

    const onClick = (e: MouseEvent) => {
      if (!pickMode) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        const target = e.target as Element;
        const sel = uniqueSelector(target);
        setAnchorSelector(sel);
      } finally {
        setPickMode(false);
      }
    };
    const onLoad = () => setDocReady(true);

    const doc = ifr.contentDocument || ifr.contentWindow?.document;
    doc?.addEventListener("click", onClick, true);
    ifr.addEventListener("load", onLoad);
    return () => {
      doc?.removeEventListener("click", onClick, true);
      ifr.removeEventListener("load", onLoad);
    };
  }, [pickMode, setAnchorSelector, proxySrc]);

  const ensureShadowMount = useCallback(() => {
    const ifr = iframeRef.current;
    if (!ifr) return null;
    const doc = ifr.contentDocument || ifr.contentWindow?.document;
    if (!doc) return null;

    let target: HTMLElement | null =
      (anchorSelector
        ? (doc.querySelector(anchorSelector) as HTMLElement)
        : null) || (doc.body as HTMLElement);

    if (!target || target === doc.documentElement || target === doc.head) {
      target = doc.body as HTMLElement;
    }

    let mount = doc.getElementById("reco-mount") as HTMLElement | null;
    if (!mount) {
      mount = doc.createElement("div");
      mount.id = "reco-mount";
      mount.style.cssText =
        "all:initial; display:block; width:100%; contain:content;";
      try {
        target.insertAdjacentElement("afterend", mount); // ALTINA
      } catch {
        (doc.body as HTMLElement).appendChild(mount);
      }
      const sr = mount.attachShadow({ mode: "open" });

      const themeStyle = doc.createElement("style");
      themeStyle.textContent = themeVars(localTheme);
      sr.appendChild(themeStyle);

      const style = doc.createElement("style");
      style.textContent = WIDGET_CSS;
      sr.appendChild(style);

      setShadowRoot(sr);
      return sr;
    } else {
      try {
        target.insertAdjacentElement("afterend", mount);
      } catch {
        (doc.body as HTMLElement).appendChild(mount);
      }
      if (!mount.shadowRoot) {
        const sr = mount.attachShadow({ mode: "open" });
        const themeStyle = doc.createElement("style");
        themeStyle.textContent = themeVars(localTheme);
        sr.appendChild(themeStyle);
        const style = doc.createElement("style");
        style.textContent = WIDGET_CSS;
        sr.appendChild(style);
        setShadowRoot(sr);
        return sr;
      }
      setShadowRoot(mount.shadowRoot);
      return mount.shadowRoot;
    }
  }, [anchorSelector, localTheme]);

  useEffect(() => {
    if (!docReady) return;
    try {
      ensureShadowMount();
    } catch {}
  }, [docReady, ensureShadowMount, anchorSelector, list.length]);

  const saveBadge = (id: string, text: string) => {
    editor.setBadgeText?.(id, text.trim());
    if (!editor.setBadgeText) {
      const ev = new CustomEvent("reco-badge-change", {
        detail: { id, text: text.trim() },
      });
      window.dispatchEvent(ev);
    }
  };

  const itemWidthPct = 100 / (perView * pageCount);
  const leftArrow = showLeftArrow ?? true;
  const rightArrow = showRightArrow ?? true;

  const Widget = (
    <div className="rs-wrap" style={{ width: Math.min(viewWidth, 1200) }}>
      <h2 className="rs-title">Son Bakılan Ürünler</h2>

      <div className="rs-slider">
        {leftArrow && (
          <button
            className="rs-arrow rs-prev"
            onClick={prev}
            aria-label="Önceki"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {rightArrow && (
          <button
            className="rs-arrow rs-next"
            onClick={next}
            aria-label="Sonraki"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <div
          className="rs-track"
          style={{
            width: `${Math.max(pageCount, 1) * 100}%`,
            transform: `translateX(-${page * (100 / pageCount)}%)`,
          }}
        >
          {list.map((p) => {
            const initialBadge = (badgeMap[p.id] ?? p.badge ?? "New").trim();
            return (
              <div
                key={p.id}
                className="rs-item"
                style={{ width: `${itemWidthPct}%` }}
              >
                <div className="rs-card">
                  {showImage && (
                    <div className="rs-img">
                      <img src={p.image} alt={p.title} loading="lazy" />
                      {showBadge && (
                        <span
                          className="rs-badge"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            saveBadge(p.id, e.currentTarget.textContent || "")
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.currentTarget as HTMLElement).blur();
                            }
                          }}
                        >
                          {initialBadge || "—"}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="rs-body">
                    {showTitle && <p className="rs-title2">{p.title}</p>}
                    <p className="rs-price">
                      {p.price.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showBullets && (
          <div className="rs-bullets">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                className={`rs-dot ${i === page ? "is-active" : ""}`}
                onClick={() => setPage(i)}
                aria-label={`Sayfa ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (showPreview && currentUrl) {
    const isFramed = device !== "desktop";
    const frameRadius = device === "mobile" ? 24 : 16;

    return (
      <div
        className="h-full w-full relative flex items-center justify-center"
        ref={wrapperRef}
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,215,64,0.20) 0 22%, transparent 23%), radial-gradient(circle at 80% 60%, rgba(255,215,64,0.18) 0 18%, transparent 19%), #0b0b0b",
        }}
      >
        {/* Cihaz çerçevesi (tablet/telefon) */}
        <div
          className={isFramed ? "shadow-2xl" : ""}
          style={
            isFramed
              ? {
                  width: `${viewWidth}px`,
                  height: `${viewHeight || 900}px`,
                  borderRadius: `${frameRadius}px`,
                  overflow: "hidden",
                  boxShadow:
                    "0 30px 80px rgba(0,0,0,.45), 0 0 0 10px rgba(255,255,255,.06) inset",
                  background: "#fff",
                  position: "relative",
                }
              : { position: "absolute", inset: 0 }
          }
        >
          <iframe
            key={proxySrc || device}
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            style={
              isFramed
                ? { display: "block" }
                : {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                  }
            }
            src={proxySrc}
            sandbox="allow-scripts allow-forms allow-same-origin"
            referrerPolicy="no-referrer"
          />
          {/* Seçim butonu */}
          <button
            onClick={() => setPickMode((s) => !s)}
            className="rounded-lg px-3 py-2 text-sm flex items-center gap-2"
            style={{
              position: "absolute",
              left: isFramed ? 12 : 16,
              bottom: isFramed ? 12 : 16,
              zIndex: 30,
              background: pickMode ? "#2563eb" : "rgba(0,0,0,.6)",
              color: "#fff",
            }}
            title="Sayfadan bir eleman seç ve widget’i oraya ekle"
          >
            <Pointer size={16} />{" "}
            {pickMode ? "Seçim modu AÇIK" : "Sayfadan Seç"}
          </button>
        </div>

        {/* ShadowRoot varsa portal */}
        {shadowRoot && createPortal(Widget, shadowRoot)}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`h-full w-full overflow-hidden relative ${
        panning
          ? "cursor-grabbing"
          : isSpace.current
          ? "cursor-grab"
          : "cursor-default"
      }`}
      style={{
        background:
          "radial-gradient(var(--grid-dot-1, #D1D5DB) 1px, transparent 1px) 0 0/16px 16px, radial-gradient(var(--grid-dot-2, #E5E7EB) 1px, transparent 1px) 8px 8px/16px 16px, #f7f7f7",
      }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
        className="min-w-[2600px] min-h-[1400px] p-10 flex items-start justify-center"
      >
        <div className="rs-scope" style={{ width: Math.min(viewWidth, 1200) }}>
          <style id="reco-widget-theme-edit">{themeVars(localTheme)}</style>
          <style id="reco-widget-edit-css">{WIDGET_CSS_EDIT(localTheme)}</style>
          {Widget}
        </div>
      </div>

      <div
        className="absolute right-4 bottom-4 z-30 rounded-lg px-2 py-1 flex items-center gap-2"
        style={{ background: "rgba(0,0,0,.6)", color: "#fff" }}
      >
        <button
          onClick={zoomOut}
          className="p-2 rounded-md hover:bg-white/10"
          aria-label="zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-xs tabular-nums w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-2 rounded-md hover:bg-white/10"
          aria-label="zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
