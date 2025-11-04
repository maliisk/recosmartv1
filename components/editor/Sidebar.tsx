"use client";

import {
  ChevronDown,
  Settings,
  Rocket,
  Eye,
  Link as LinkIcon,
  Loader2,
  Globe,
  XCircle,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useEditor } from "./EditorContext";

function Section(props: {
  id: string;
  title: string;
  open: Record<string, boolean>;
  setOpen: (v: Record<string, boolean>) => void;
  children: ReactNode;
}) {
  const { id, title, open, setOpen, children } = props;
  const isOpen = open[id];
  return (
    <div className="border-b border-white/10" data-tour={id}>
      <button
        data-header
        onClick={() => setOpen({ ...open, [id]: !isOpen })}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 items-center">{children}</div>;
}
function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs text-white/70">{children}</span>;
}
function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 p-0 bg-transparent border border-white/10 rounded"
      title={value}
    />
  );
}

type Theme = {
  accent: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  text: string;
  price: string;
  radius: number;
  shadow: string;
  dot: string;
  arrowBg: string;
  badgeBg: string;
  badgeColor: string;
  fontFamily: string;
};

const DEFAULT_THEME: Theme = {
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

function applyCssVars(th: Theme) {
  const id = "reco-theme-vars";
  let s = document.getElementById(id) as HTMLStyleElement | null;
  if (!s) {
    s = document.createElement("style");
    s.id = id;
    document.head.appendChild(s);
  }
  s.innerHTML = `
:root{
  --reco-accent:${th.accent};
  --reco-card-bg:${th.cardBg};
  --reco-card-border:${th.cardBorder};
  --reco-title:${th.titleColor};
  --reco-text:${th.text};
  --reco-price:${th.price};
  --reco-radius:${th.radius}px;
  --reco-shadow:${th.shadow};
  --reco-dot:${th.dot};
  --reco-arrow-bg:${th.arrowBg};
  --reco-badge-bg:${th.badgeBg};
  --reco-badge-color:${th.badgeColor};
  --reco-font:${th.fontFamily};
}
`;
}

function emitThemePatch(patch: Partial<Theme>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<Partial<Theme>>("reco-theme-change", { detail: patch })
    );
  }
}

export default function Sidebar() {
  const [open, setOpen] = useState<Record<string, boolean>>({
    datasource: true,
    theme: true,
    wrapper: true,
    product: true,
    price: true,
    arrows: true,
    pagination: true,
    anchor: true,
    who: false,
    where: false,
    when: false,
  });

  const {
    xmlUrl,
    setXmlUrl,
    fetchFromXml,
    loading,
    error,
    products,
    priceMode,
    setPriceMode,
    productCount,
    setProductCount,
    showImage,
    setShowImage,
    showTitle,
    setShowTitle,
    showBadge,
    setShowBadge,
    showLeftArrow,
    setShowLeftArrow,
    showRightArrow,
    setShowRightArrow,
    showBullets,
    setShowBullets,
    previewUrl,
    setPreviewUrl,
    fetchPreviewSnapshot,
    previewLoading,
    previewError,
    showPreview,
    setShowPreview,
    anchorSelector,
    setAnchorSelector,
    anchorMode,
    setAnchorMode,
    picking,
    setPicking,
  } = useEditor();

  const [localTheme, setLocalTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    applyCssVars(localTheme);
    emitThemePatch(localTheme);
  }, []);

  useEffect(() => {
    applyCssVars(localTheme);
  }, [localTheme]);

  const patchTheme = (patch: Partial<Theme>) => {
    setLocalTheme((t) => {
      const next = { ...t, ...patch };
      emitThemePatch(patch);
      return next;
    });
  };

  const resetTheme = () => {
    setLocalTheme(DEFAULT_THEME);
    emitThemePatch(DEFAULT_THEME);
  };

  return (
    <aside
      id="editor-sidebar"
      className="w-80 shrink-0 h-[calc(100vh-64px)] bg-neutral-900/60 backdrop-blur border-r border-white/10 rounded-l-2xl overflow-y-auto scroll-thin"
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Settings className="w-4 h-4 text-brand" />
        <span className="text-sm text-white/80">RecoSmart • Editor</span>
      </div>

      {/* Data Source */}
      <Section
        id="datasource"
        title="Data Source"
        open={open}
        setOpen={setOpen}
      >
        <label className="text-xs text-white/70">XML URL</label>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
            placeholder="https://.../feed.xml"
            value={xmlUrl}
            onChange={(e) => setXmlUrl(e.target.value)}
          />
          <button
            onClick={fetchFromXml}
            disabled={!xmlUrl || loading}
            className="inline-flex items-center gap-1 rounded-md bg-brand hover:bg-brand-dark px-3 py-2 text-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            Yükle
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {products.length > 0 && (
          <p className="text-xs text-white/60">
            Yüklenen ürün: {products.length}
          </p>
        )}

        <label className="text-xs text-white/70 mt-3 block">
          Preview Site URL
        </label>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
            placeholder="https://www.orneksite.com"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
          />
          <button
            onClick={fetchPreviewSnapshot}
            disabled={!previewUrl || previewLoading}
            className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-sm disabled:opacity-50"
            title="Sayfanın snapshot'ını al ve canvas'ta göster"
          >
            {previewLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Preview
          </button>
        </div>
        {previewError && (
          <div className="flex items-start gap-2 text-xs text-red-300">
            <XCircle className="w-4 h-4 mt-0.5" /> <span>{previewError}</span>
          </div>
        )}
        {showPreview && (
          <button
            onClick={() => setShowPreview(false)}
            className="mt-2 text-xs text-white/60 underline"
          >
            Preview’i kapat
          </button>
        )}
      </Section>

      {/* Theme */}
      <Section id="theme" title="Theme" open={open} setOpen={setOpen}>
        <div className="text-xs text-white/60 mb-1">
          Renk • Radius • Shadow • Font
        </div>

        <Row>
          <Label>Accent</Label>
          <ColorInput
            value={localTheme.accent}
            onChange={(v) => patchTheme({ accent: v })}
          />
        </Row>
        <Row>
          <Label>Card BG</Label>
          <ColorInput
            value={localTheme.cardBg}
            onChange={(v) => patchTheme({ cardBg: v })}
          />
        </Row>
        <Row>
          <Label>Border (rgba)</Label>
          <input
            className="rounded-md bg-white/10 border border-white/10 px-2 py-1.5 text-xs outline-none"
            value={localTheme.cardBorder}
            onChange={(e) => patchTheme({ cardBorder: e.target.value })}
            placeholder="rgba(0,0,0,.06)"
          />
        </Row>
        <Row>
          <Label>Title</Label>
          <ColorInput
            value={localTheme.titleColor}
            onChange={(v) => patchTheme({ titleColor: v })}
          />
        </Row>
        <Row>
          <Label>Text</Label>
          <ColorInput
            value={localTheme.text}
            onChange={(v) => patchTheme({ text: v })}
          />
        </Row>
        <Row>
          <Label>Price</Label>
          <ColorInput
            value={localTheme.price}
            onChange={(v) => patchTheme({ price: v })}
          />
        </Row>
        <Row>
          <Label>Arrow BG</Label>
          <ColorInput
            value={localTheme.arrowBg}
            onChange={(v) => patchTheme({ arrowBg: v })}
          />
        </Row>
        <Row>
          <Label>Bullet Dot</Label>
          <ColorInput
            value={localTheme.dot}
            onChange={(v) => patchTheme({ dot: v })}
          />
        </Row>
        <Row>
          <Label>Badge BG</Label>
          <ColorInput
            value={localTheme.badgeBg}
            onChange={(v) => patchTheme({ badgeBg: v })}
          />
        </Row>
        <Row>
          <Label>Badge Text</Label>
          <ColorInput
            value={localTheme.badgeColor}
            onChange={(v) => patchTheme({ badgeColor: v })}
          />
        </Row>

        <div className="pt-2">
          <div className="flex items-center justify-between">
            <Label>Border Radius</Label>
            <span className="text-xs text-white/60 tabular-nums">
              {localTheme.radius}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={28}
            step={1}
            value={localTheme.radius}
            onChange={(e) =>
              patchTheme({ radius: parseInt(e.target.value, 10) })
            }
            className="w-full"
          />
        </div>

        <Row>
          <Label>Shadow CSS</Label>
          <input
            className="rounded-md bg-white/10 border border-white/10 px-2 py-1.5 text-xs outline-none"
            value={localTheme.shadow}
            onChange={(e) => patchTheme({ shadow: e.target.value })}
            placeholder="0 10px 30px rgba(0,0,0,.08)"
          />
        </Row>

        <Row>
          <Label>Font</Label>
          <select
            className="rounded-md bg-white/10 border border-white/10 px-2 py-1.5 text-xs outline-none"
            value={localTheme.fontFamily}
            onChange={(e) => patchTheme({ fontFamily: e.target.value })}
          >
            <option value={DEFAULT_THEME.fontFamily}>System</option>
            <option value='Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial'>
              Inter
            </option>
            <option value='Roboto, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, "Noto Sans"'>
              Roboto
            </option>
            <option value='Poppins, "Segoe UI", ui-sans-serif, system-ui, Arial'>
              Poppins
            </option>
            <option value='Georgia, "Times New Roman", serif'>Georgia</option>
            <option value='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'>
              Mono
            </option>
          </select>
        </Row>

        <button
          onClick={resetTheme}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
          title="Temayı varsayılana döndür"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Theme
        </button>
      </Section>

      {/* Wrapper (bilgilendirme) */}
      <Section id="wrapper" title="Wrapper" open={open} setOpen={setOpen}>
        <div className="text-sm text-white/70">
          Container padding, card radius, shadow.
        </div>
      </Section>

      {/* Product */}
      <Section id="product" title="Product" open={open} setOpen={setOpen}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showImage}
            onChange={(e) => setShowImage(e.target.checked)}
          />
          Image
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showTitle}
            onChange={(e) => setShowTitle(e.target.checked)}
          />
          Title
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showBadge}
            onChange={(e) => setShowBadge(e.target.checked)}
          />
          Badge
        </label>
      </Section>

      {/* Price */}
      <Section id="price" title="Price" open={open} setOpen={setOpen}>
        <div className="text-xs text-white/60">Fiyat Tercihi</div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="priceMode"
            className="accent-brand"
            checked={priceMode === "discount"}
            onChange={() => setPriceMode("discount")}
          />
          İndirimli Fiyat
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="priceMode"
            className="accent-brand"
            checked={priceMode === "original"}
            onChange={() => setPriceMode("original")}
          />
          Orijinal Fiyat
        </label>

        <div className="pt-2">
          <div className="text-xs text-white/60 mb-1">Kart Sayısı (4–24)</div>
          <input
            type="range"
            min={4}
            max={24}
            step={1}
            value={productCount}
            onChange={(e) => setProductCount(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="text-right text-xs text-white/60">{productCount}</div>
        </div>
      </Section>

      {/* Arrows */}
      <Section id="arrows" title="Arrows" open={open} setOpen={setOpen}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showLeftArrow}
            onChange={(e) => setShowLeftArrow(e.target.checked)}
          />
          Left arrow
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showRightArrow}
            onChange={(e) => setShowRightArrow(e.target.checked)}
          />
          Right arrow
        </label>
      </Section>

      {/* Pagination */}
      <Section id="pagination" title="Pagination" open={open} setOpen={setOpen}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={showBullets}
            onChange={(e) => setShowBullets(e.target.checked)}
          />
          Bullets
        </label>
      </Section>

      {/* Anchor Injection */}
      <Section
        id="anchor"
        title="Anchor Injection"
        open={open}
        setOpen={setOpen}
      >
        <div className="text-xs text-white/60">
          Widget’i hedef bölgede sabitle. “Sayfadan Seç” ile belirlediğin
          elemana göre <b>before/after/append</b>.
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">CSS Selector</label>
          <input
            className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
            placeholder=".cards"
            value={anchorSelector}
            onChange={(e) => setAnchorSelector(e.target.value)}
          />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-white/60">Mode:</span>
            <button
              className={`px-2 py-1 rounded ${
                anchorMode === "before" ? "bg-brand" : "bg-white/10"
              }`}
              onClick={() => setAnchorMode("before")}
            >
              before
            </button>
            <button
              className={`px-2 py-1 rounded ${
                anchorMode === "after" ? "bg-brand" : "bg-white/10"
              }`}
              onClick={() => setAnchorMode("after")}
            >
              after
            </button>
            <button
              className={`px-2 py-1 rounded ${
                anchorMode === "append" ? "bg-brand" : "bg-white/10"
              }`}
              onClick={() => setAnchorMode("append")}
            >
              append
            </button>
          </div>

          <button
            className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm ${
              picking ? "bg-brand/80" : "bg-white/10 hover:bg-white/15"
            }`}
            onClick={() => setPicking(!picking)}
            disabled={!showPreview}
            title="Preview açıkken sayfadan hedef elementi tıkla"
          >
            <MousePointerClick className="w-4 h-4" />
            {picking ? "Seçim modu: AÇIK (sayfadan tıkla)" : "Sayfadan Seç"}
          </button>
        </div>
      </Section>

      {/* Who / Where / When */}
      <Section id="who" title="Who views" open={open} setOpen={setOpen}>
        <div className="text-sm text-white/70">
          segments / basic rules (iskelet)
        </div>
      </Section>
      <Section id="where" title="Where views" open={open} setOpen={setOpen}>
        <div className="text-sm text-white/70">screens / pages (iskelet)</div>
      </Section>
      <Section id="when" title="When views" open={open} setOpen={setOpen}>
        <div className="text-sm text-white/70">calendar (iskelet)</div>
      </Section>

      {/* alt bar */}
      <div className="mt-auto p-4 border-t border-white/10 flex items-center gap-2">
        <Rocket className="w-4 h-4 text-brand" />
        <Link href="/" className="text-sm hover:underline">
          Preview
        </Link>
        <Eye className="w-4 h-4 ml-auto text-white/70" />
      </div>
    </aside>
  );
}
