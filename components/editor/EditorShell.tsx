"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { DeviceKey } from "@/lib/devices";
import { EditorProvider } from "./EditorContext";
import Sidebar from "./Sidebar";
import DeviceBar from "./DeviceBar";
import Canvas from "./Canvas";

export default function EditorShell() {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const sp = useSearchParams();
  const router = useRouter();

  // Sayfadaki harici/önceki header'ları temizle (bizimkini hariç)
  useEffect(() => {
    document.querySelectorAll("header").forEach((h) => {
      if (!(h as HTMLElement).id || (h as HTMLElement).id !== "editor-header") {
        h.parentElement?.removeChild(h);
      }
    });
  }, []);

  // Kendi header'ımızın yüksekliğini ölç ve --headerH yaz
  const headerRef = useRef<HTMLElement | null>(null);
  const writeHeaderVar = () => {
    const h = headerRef.current?.offsetHeight ?? 0;
    document.documentElement.style.setProperty("--headerH", `${h}px`);
  };
  useEffect(() => {
    writeHeaderVar();
    const ro = new ResizeObserver(writeHeaderVar);
    if (headerRef.current) ro.observe(headerRef.current);
    const onResize = () => writeHeaderVar();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const steps = useMemo(
    () => [
      {
        id: "datasource",
        title: "Data Source",
        content: "XML URL girip ‘Yükle’ ile ürünleri editöre çek.",
        selector: '[data-tour="datasource"]',
      },
      {
        id: "theme",
        title: "Theme",
        content: "Renk / radius / shadow / font ayarları.",
        selector: '[data-tour="theme"]',
      },
      {
        id: "wrapper",
        title: "Wrapper",
        content: "Kapsayıcı görünüm ayarları.",
        selector: '[data-tour="wrapper"]',
      },
      {
        id: "product",
        title: "Product",
        content: "Kartta görüntülenecek alanları aç/kapat.",
        selector: '[data-tour="product"]',
      },
      {
        id: "price",
        title: "Price",
        content: "Fiyat modunu simüle et.",
        selector: '[data-tour="price"]',
      },
      {
        id: "arrows",
        title: "Arrows",
        content: "Sol/Sağ ok görünürlüğü.",
        selector: '[data-tour="arrows"]',
      },
      {
        id: "pagination",
        title: "Pagination",
        content: "Alt sayfa noktaları (bullets).",
        selector: '[data-tour="pagination"]',
      },
      {
        id: "anchor",
        title: "Anchor",
        content: "Preview’da element seçip widget’ı konumlandır.",
        selector: '[data-tour="anchor"]',
      },
    ],
    []
  );

  return (
    <EditorProvider>
      <div className="h-screen w-full flex flex-col bg-[#eef1f5]">
        {/* BÜYÜK HEADER */}
        <header
          id="editor-header"
          ref={headerRef}
          className="w-full bg-white border-b border-slate-200 flex items-center justify-between px-6
                     h-28 md:h-32 min-h-[7rem]" // görünür yüksek
        >
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={168}
              height={34}
              priority
            />
          </div>
          <div className="[&_*]:text-slate-900 [&_*]:fill-slate-900 [&_*]:stroke-slate-900">
            <DeviceBar device={device} setDevice={setDevice} />
          </div>
        </header>

        {/* İçerik alanı: dinamik yükseklik */}
        <div
          className="w-full flex"
          style={{ height: "calc(100vh - var(--headerH, 0px))" }}
        >
          <Sidebar />
          <main className="flex-1 h-full overflow-hidden">
            <Canvas device={device} />
          </main>
        </div>
      </div>
    </EditorProvider>
  );
}
