"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DeviceKey } from "@/lib/devices";
import { EditorProvider } from "./EditorContext";
import Sidebar from "./Sidebar";
import DeviceBar from "./DeviceBar";
import Canvas from "./Canvas";
import TourOverlay from "./TourOverlay";

export default function EditorShell() {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const sp = useSearchParams();
  const router = useRouter();

  // Tutorial durumu (URL: ?tutorial=1)
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    setShowTutorial(sp.get("tutorial") === "1");
  }, [sp]);

  // Tutorial kapanınca ANASAYFA
  const exitTutorialToHome = () => {
    setShowTutorial(false);
    router.push("/"); // anasayfa
  };

  // Dış header'ları temizle
  useEffect(() => {
    document.querySelectorAll("header").forEach((h) => {
      if (!(h as HTMLElement).id || (h as HTMLElement).id !== "editor-header") {
        h.parentElement?.removeChild(h);
      }
    });
  }, []);

  // Header yüksekliği -> CSS var
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

  // Tutorial adımları
  const steps = useMemo(
    () => [
      {
        id: "datasource",
        title: "Data Source",
        content:
          "XML URL girip ‘Yükle’ ile ürünleri editöre çek. Site URL girip ‘Preview’ ile siteni görüntüle.",
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
        content: "Fiyat modunu simüle et ve kart sayısını ayarla.",
        selector: '[data-tour="price"]',
      },
      {
        id: "arrows",
        title: "Arrows",
        content: "Sol/Sağ ok görünürlüğünü yönet.",
        selector: '[data-tour="arrows"]',
      },
      {
        id: "pagination",
        title: "Pagination",
        content: "Alt sayfa noktalarını (bullets) aç/kapat.",
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
        {/* HEADER */}
        <header
          id="editor-header"
          ref={headerRef}
          className="w-full bg-white border-b border-slate-200 flex items-center justify-between px-6 h-28 md:h-32 min-h-[7rem]"
        >
          <div className="flex items-center gap-3">
            {/* Logo → anasayfa */}
            <Link href="/" aria-label="Ana sayfa">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={168}
                height={34}
                priority
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="[&_*]:text-slate-900 [&_*]:fill-slate-900 [&_*]:stroke-slate-900">
            <DeviceBar device={device} setDevice={setDevice} />
          </div>
        </header>

        {/* İçerik */}
        <div
          className="w-full flex"
          style={{ height: "calc(100vh - var(--headerH, 0px))" }}
        >
          {/* Tutorial modunda Recommend dropdown açık gelsin */}
          <Sidebar defaultRecommendOpen={showTutorial} />
          <main className="flex-1 h-full overflow-hidden">
            <Canvas device={device} />
          </main>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <TourOverlay
        active={showTutorial}
        steps={steps}
        onClose={exitTutorialToHome}
        onFinish={exitTutorialToHome}
      />
    </EditorProvider>
  );
}
