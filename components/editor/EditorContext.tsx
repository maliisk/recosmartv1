"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/widget";

type PriceMode = "discount" | "original";
type AnchorMode = "before" | "after" | "append";

type Ctx = {
  xmlUrl: string;
  setXmlUrl: (v: string) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  loading: boolean;
  error: string | null;
  fetchFromXml: () => Promise<void>;

  priceMode: PriceMode;
  setPriceMode: (m: PriceMode) => void;
  productCount: number;
  setProductCount: (n: number) => void;

  showImage: boolean;
  setShowImage: (v: boolean) => void;
  showTitle: boolean;
  setShowTitle: (v: boolean) => void;
  showBadge: boolean;
  setShowBadge: (v: boolean) => void;

  showLeftArrow: boolean;
  setShowLeftArrow: (v: boolean) => void;
  showRightArrow: boolean;
  setShowRightArrow: (v: boolean) => void;
  showBullets: boolean;
  setShowBullets: (v: boolean) => void;

  previewUrl: string;
  setPreviewUrl: (v: string) => void;
  showPreview: boolean;
  setShowPreview: (v: boolean) => void;
  previewHtml: string | null;
  fetchPreviewSnapshot: () => Promise<void>;
  previewLoading: boolean;
  previewError: string | null;

  badgeMap: Record<string, string>;
  setBadgeFor: (id: string, text: string) => void;

  // ▼ Anchor yerleşimi + picker
  anchorSelector: string;
  setAnchorSelector: (v: string) => void;
  anchorMode: AnchorMode;
  setAnchorMode: (v: AnchorMode) => void;
  picking: boolean; // sayfadan seçim modu açık mı
  setPicking: (v: boolean) => void;
};

const EditorCtx = createContext<Ctx | null>(null);
export function useEditor() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditor must be used within <EditorProvider />");
  return ctx;
}

const LSK = {
  XML_URL: "recosmart_xml_url",
  PRICE_MODE: "recosmart_price_mode",
  PRODUCT_COUNT: "recosmart_product_count",
  SHOW_IMAGE: "recosmart_show_image",
  SHOW_TITLE: "recosmart_show_title",
  SHOW_BADGE: "recosmart_show_badge",
  SHOW_LA: "recosmart_show_la",
  SHOW_RA: "recosmart_show_ra",
  SHOW_BULLETS: "recosmart_show_bullets",
  PREVIEW_URL: "recosmart_preview_url",
  SHOW_PREVIEW: "recosmart_show_preview",
  BADGE_MAP: "recosmart_badge_map",
  ANCHOR_SELECTOR: "recosmart_anchor_selector",
  ANCHOR_MODE: "recosmart_anchor_mode",
};

export function EditorProvider({ children }: { children: ReactNode }) {
  const [xmlUrl, setXmlUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priceMode, setPriceMode] = useState<PriceMode>("discount");
  const [productCount, setProductCount] = useState(8);

  const [showImage, setShowImage] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  const [showLeftArrow, setShowLeftArrow] = useState(true);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showBullets, setShowBullets] = useState(true);

  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [badgeMap, setBadgeMap] = useState<Record<string, string>>({});

  // ▼ Anchor + picker
  const [anchorSelector, setAnchorSelector] = useState("");
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("append");
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    try {
      const bool = (k: string, def = true) => {
        const v = localStorage.getItem(k);
        return v === null ? def : v === "true";
      };
      const s = (k: string) => localStorage.getItem(k);

      const savedUrl = s(LSK.XML_URL);
      const savedMode = s(LSK.PRICE_MODE) as PriceMode | null;
      const savedCount = Number(s(LSK.PRODUCT_COUNT) || 0);
      const savedPreview = s(LSK.PREVIEW_URL);
      const savedShowPreview = bool(LSK.SHOW_PREVIEW, false);
      const savedBadge = s(LSK.BADGE_MAP);
      const savedAnchor = s(LSK.ANCHOR_SELECTOR) || "";
      const savedAnchorMode = (s(LSK.ANCHOR_MODE) as AnchorMode) || "append";

      if (savedUrl) setXmlUrl(savedUrl);
      if (savedMode === "discount" || savedMode === "original")
        setPriceMode(savedMode);
      if (savedCount >= 4 && savedCount <= 24) setProductCount(savedCount);
      if (savedPreview) setPreviewUrl(savedPreview);
      setShowPreview(savedShowPreview);

      setShowImage(bool(LSK.SHOW_IMAGE));
      setShowTitle(bool(LSK.SHOW_TITLE));
      setShowBadge(bool(LSK.SHOW_BADGE));
      setShowLeftArrow(bool(LSK.SHOW_LA));
      setShowRightArrow(bool(LSK.SHOW_RA));
      setShowBullets(bool(LSK.SHOW_BULLETS));

      setAnchorSelector(savedAnchor);
      setAnchorMode(
        savedAnchorMode === "before" || savedAnchorMode === "after"
          ? savedAnchorMode
          : "append"
      );

      if (savedBadge) {
        try {
          setBadgeMap(JSON.parse(savedBadge));
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LSK.PRICE_MODE, priceMode);
      localStorage.setItem(LSK.PRODUCT_COUNT, String(productCount));
      localStorage.setItem(LSK.SHOW_IMAGE, String(showImage));
      localStorage.setItem(LSK.SHOW_TITLE, String(showTitle));
      localStorage.setItem(LSK.SHOW_BADGE, String(showBadge));
      localStorage.setItem(LSK.SHOW_LA, String(showLeftArrow));
      localStorage.setItem(LSK.SHOW_RA, String(showRightArrow));
      localStorage.setItem(LSK.SHOW_BULLETS, String(showBullets));
      localStorage.setItem(LSK.PREVIEW_URL, previewUrl);
      localStorage.setItem(LSK.SHOW_PREVIEW, String(showPreview));
      localStorage.setItem(LSK.BADGE_MAP, JSON.stringify(badgeMap));
      localStorage.setItem(LSK.ANCHOR_SELECTOR, anchorSelector);
      localStorage.setItem(LSK.ANCHOR_MODE, anchorMode);
    } catch {}
  }, [
    priceMode,
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
    anchorSelector,
    anchorMode,
  ]);

  async function fetchFromXml() {
    if (!xmlUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fetch-xml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: xmlUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yükleme başarısız");
      setProducts(data.products || []);
      localStorage.setItem(LSK.XML_URL, xmlUrl);
    } catch (e: any) {
      setError(e?.message || "Hata");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPreviewSnapshot() {
    if (!previewUrl) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch("/api/preview-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: previewUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data?.html)
        throw new Error(data?.error || "Snapshot alınamadı");
      setPreviewHtml(data.html);
      setShowPreview(true);
    } catch (e: any) {
      setPreviewError(e?.message || "Snapshot hatası");
      setPreviewHtml(null);
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  }

  function setBadgeFor(id: string, text: string) {
    setBadgeMap((m) => ({ ...m, [id]: text }));
  }

  return (
    <EditorCtx.Provider
      value={{
        xmlUrl,
        setXmlUrl,
        products,
        setProducts,
        loading,
        error,
        fetchFromXml,
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
        showPreview,
        setShowPreview,
        previewHtml,
        fetchPreviewSnapshot,
        previewLoading,
        previewError,
        badgeMap,
        setBadgeFor,
        anchorSelector,
        setAnchorSelector,
        anchorMode,
        setAnchorMode,
        picking,
        setPicking,
      }}
    >
      {children}
    </EditorCtx.Provider>
  );
}
