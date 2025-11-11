"use client";

import {
  ChevronDown,
  ChevronRight,
  Settings,
  Rocket,
  Eye,
  Link as LinkIcon,
  Loader2,
  Globe,
  XCircle,
  MousePointerClick,
  RefreshCw,
  Users,
  Megaphone,
  Target as TargetIcon,
  LineChart,
  Gauge,
  Database,
  Cog,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useEditor } from "./EditorContext";

/* ------- yardımcı ui ------- */
function GroupHeader({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
      ${
        active ? "bg-sky-50 text-sky-700" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-sm">{label}</span>
      {onClick && (
        <span className="ml-auto shrink-0 text-slate-400">
          {active ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </button>
  );
}

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
    <div className="border border-slate-200 rounded-md bg-white" data-tour={id}>
      <button
        onClick={() => setOpen({ ...open, [id]: !isOpen })}
        className="w-full flex items-center justify-between px-3 py-2"
      >
        <span className="text-sm font-medium text-slate-800">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}
function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 items-center">{children}</div>;
}
function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs text-slate-600">{children}</span>;
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
      className="w-full h-8 p-0 bg-white border border-slate-200 rounded"
      title={value}
    />
  );
}

/* ------- tema ------- */
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
  accent: "#0f172a",
  cardBg: "#ffffff",
  cardBorder: "rgba(0,0,0,.06)",
  titleColor: "#0f172a",
  text: "#334155",
  price: "#0f172a",
  radius: 12,
  shadow: "0 10px 30px rgba(2,6,23,.08)",
  dot: "#cbd5e1",
  arrowBg: "#ffffff",
  badgeBg: "rgba(2,6,23,.80)",
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
}`;
}
function emitThemePatch(patch: Partial<Theme>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<Partial<Theme>>("reco-theme-change", { detail: patch })
    );
  }
}

/* ------- Sidebar ------- */
export default function Sidebar({
  defaultRecommendOpen = false,
}: {
  defaultRecommendOpen?: boolean;
}) {
  // Recommend: editörde kapalı, tutorial modunda açık gelsin
  const [recommendOpen, setRecommendOpen] = useState(!!defaultRecommendOpen);
  useEffect(() => {
    if (defaultRecommendOpen) setRecommendOpen(true);
  }, [defaultRecommendOpen]);

  const [open, setOpen] = useState<Record<string, boolean>>({
    datasource: true,
    theme: true,
    wrapper: true,
    product: true,
    price: true,
    arrows: true,
    pagination: true,
    anchor: true,
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

  const patchTheme = (p: Partial<Theme>) => {
    setLocalTheme((t) => {
      const n = { ...t, ...p };
      emitThemePatch(p);
      return n;
    });
  };
  const resetTheme = () => {
    setLocalTheme(DEFAULT_THEME);
    emitThemePatch(DEFAULT_THEME);
  };

  return (
    <aside
      id="editor-sidebar"
      className="w-72 shrink-0 bg-white border-r border-slate-200 overflow-y-auto"
      style={{ height: "calc(100vh - var(--headerH, 0px))" }}
    >
      <div className="px-3 py-3 space-y-1">
        <GroupHeader
          icon={<Users size={18} className="text-slate-600" />}
          label="Audience"
        />
        <GroupHeader
          icon={<Megaphone size={18} className="text-slate-600" />}
          label="Campaign"
        />

        {/* Recommend + panel */}
        <div>
          <GroupHeader
            icon={<Gauge size={18} className="text-slate-600" />}
            label="Recommend"
            active={recommendOpen}
            onClick={() => setRecommendOpen((s) => !s)}
          />
          {recommendOpen && (
            <div className="mt-2 space-y-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 px-1">
                Inline • Widget
              </div>

              {/* Data Source */}
              <Section
                id="datasource"
                title="Data Source"
                open={open}
                setOpen={setOpen}
              >
                <label className="text-xs text-slate-600">XML URL</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-md bg-white border border-slate-300 px-3 py-2 text-sm outline-none
                               text-slate-800 placeholder:text-slate-400"
                    placeholder="https://.../feed.xml"
                    value={xmlUrl}
                    onChange={(e) => setXmlUrl(e.target.value)}
                  />
                  <button
                    onClick={fetchFromXml}
                    disabled={!xmlUrl || loading}
                    className="shrink-0 inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-700
                               text-white px-3 py-2 text-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    Yükle
                  </button>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {products.length > 0 && (
                  <p className="text-xs text-slate-600">
                    Yüklenen ürün: {products.length}
                  </p>
                )}

                <label className="text-xs text-slate-600 mt-3 block">
                  Preview Site URL
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-md bg-white border border-slate-300 px-3 py-2 text-sm outline-none
                               text-slate-800 placeholder:text-slate-400"
                    placeholder="https://www.orneksite.com"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                  />
                  <button
                    onClick={fetchPreviewSnapshot}
                    disabled={!previewUrl || previewLoading}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm
                      ${
                        !previewUrl || previewLoading
                          ? "bg-sky-500/40 text-white cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700 text-white"
                      }`}
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
                  <div className="flex items-start gap-2 text-xs text-red-600">
                    <XCircle className="w-4 h-4 mt-0.5" />{" "}
                    <span>{previewError}</span>
                  </div>
                )}
                {showPreview && (
                  <button
                    onClick={() => setShowPreview(false)}
                    className="mt-2 text-xs text-slate-600 underline"
                  >
                    Preview’i kapat
                  </button>
                )}
              </Section>

              {/* Theme */}
              <Section id="theme" title="Theme" open={open} setOpen={setOpen}>
                <div className="text-xs text-slate-600 mb-1">
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
                    className="rounded-md bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none
                               text-slate-800 placeholder:text-slate-400"
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
                    <span className="text-xs text-slate-600 tabular-nums">
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
                    className="rounded-md bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none
                               text-slate-800 placeholder:text-slate-400"
                    value={localTheme.shadow}
                    onChange={(e) => patchTheme({ shadow: e.target.value })}
                    placeholder="0 10px 30px rgba(2,6,23,.08)"
                  />
                </Row>

                <Row>
                  <Label>Font</Label>
                  <select
                    className="rounded-md bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none text-slate-800"
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
                    <option value='Georgia, "Times New Roman", serif'>
                      Georgia
                    </option>
                    <option value='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'>
                      Mono
                    </option>
                  </select>
                </Row>

                <button
                  onClick={resetTheme}
                  className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Theme
                </button>
              </Section>

              {/* Wrapper */}
              <Section
                id="wrapper"
                title="Wrapper"
                open={open}
                setOpen={setOpen}
              >
                <div className="text-sm text-slate-600">
                  Container padding, card radius, shadow.
                </div>
              </Section>

              {/* Product */}
              <Section
                id="product"
                title="Product"
                open={open}
                setOpen={setOpen}
              >
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
                    checked={showImage}
                    onChange={(e) => setShowImage(e.target.checked)}
                  />
                  Image
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
                    checked={showTitle}
                    onChange={(e) => setShowTitle(e.target.checked)}
                  />
                  Title
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
                    checked={showBadge}
                    onChange={(e) => setShowBadge(e.target.checked)}
                  />
                  Badge
                </label>
              </Section>

              {/* Price */}
              <Section id="price" title="Price" open={open} setOpen={setOpen}>
                <div className="text-xs text-slate-600">Fiyat Tercihi</div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="priceMode"
                    className="accent-sky-600"
                    checked={priceMode === "discount"}
                    onChange={() => setPriceMode("discount")}
                  />
                  İndirimli Fiyat
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="priceMode"
                    className="accent-sky-600"
                    checked={priceMode === "original"}
                    onChange={() => setPriceMode("original")}
                  />
                  Orijinal Fiyat
                </label>
                <div className="pt-2">
                  <div className="text-xs text-slate-600 mb-1">
                    Kart Sayısı (4–24)
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={1}
                    value={productCount}
                    onChange={(e) =>
                      setProductCount(parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                  <div className="text-right text-xs text-slate-600">
                    {productCount}
                  </div>
                </div>
              </Section>

              {/* Arrows */}
              <Section id="arrows" title="Arrows" open={open} setOpen={setOpen}>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
                    checked={showLeftArrow}
                    onChange={(e) => setShowLeftArrow(e.target.checked)}
                  />
                  Left arrow
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
                    checked={showRightArrow}
                    onChange={(e) => setShowRightArrow(e.target.checked)}
                  />
                  Right arrow
                </label>
              </Section>

              {/* Pagination */}
              <Section
                id="pagination"
                title="Pagination"
                open={open}
                setOpen={setOpen}
              >
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-sky-600"
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
                <div className="text-xs text-slate-600">
                  Preview açıkken “Sayfadan Seç” ile hedef elementi işaretle;
                  widget before/after/append olarak yerleşir.
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-600">CSS Selector</label>
                  <input
                    className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm outline-none
                               text-slate-800 placeholder:text-slate-400"
                    placeholder=".cards"
                    value={anchorSelector}
                    onChange={(e) => setAnchorSelector(e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-slate-600">Mode:</span>
                    <button
                      className={`px-2 py-1 rounded ${
                        anchorMode === "before"
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100"
                      }`}
                      onClick={() => setAnchorMode("before")}
                    >
                      before
                    </button>
                    <button
                      className={`px-2 py-1 rounded ${
                        anchorMode === "after"
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100"
                      }`}
                      onClick={() => setAnchorMode("after")}
                    >
                      after
                    </button>
                    <button
                      className={`px-2 py-1 rounded ${
                        anchorMode === "append"
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100"
                      }`}
                      onClick={() => setAnchorMode("append")}
                    >
                      append
                    </button>
                  </div>
                  <button
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm
                               ${
                                 picking
                                   ? "bg-sky-600 text-white"
                                   : "bg-slate-100 hover:bg-slate-200"
                               }`}
                    onClick={() => setPicking(!picking)}
                    disabled={!showPreview}
                  >
                    <MousePointerClick className="w-4 h-4" />
                    {picking
                      ? "Seçim modu: AÇIK (sayfadan tıkla)"
                      : "Sayfadan Seç"}
                  </button>
                </div>
              </Section>

              <div className="px-2 py-3 border-t border-slate-200 flex items-center gap-2 text-slate-700">
                <Rocket className="w-4 h-4 text-sky-600" />
                <Link href="/" className="text-sm hover:underline">
                  Preview
                </Link>
                <Eye className="w-4 h-4 ml-auto text-slate-500" />
              </div>
            </div>
          )}
        </div>

        {/* diğer menüler */}
        <GroupHeader
          icon={<TargetIcon size={18} className="text-slate-600" />}
          label="Target"
        />
        <GroupHeader
          icon={<Rocket size={18} className="text-slate-600" />}
          label="Autopilot"
        />
        <GroupHeader
          icon={<LineChart size={18} className="text-slate-600" />}
          label="Analytics"
        />
        <GroupHeader
          icon={<Database size={18} className="text-slate-600" />}
          label="Segment"
        />
        <GroupHeader
          icon={<Settings size={18} className="text-slate-600" />}
          label="Management"
        />
        <GroupHeader
          icon={<Cog size={18} className="text-slate-600" />}
          label="Settings"
        />
      </div>
    </aside>
  );
}
