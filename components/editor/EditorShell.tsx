"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { DeviceKey } from "@/lib/devices";
import { EditorProvider } from "./EditorContext";
import Sidebar from "./Sidebar";
import DeviceBar from "./DeviceBar";
import Canvas from "./Canvas";
import TourOverlay from "./TourOverlay";

export default function EditorShell() {
  const [device, setDevice] = useState<DeviceKey>("desktop");

  // URL: /editor?tutorial=1
  const sp = useSearchParams();
  const isTutorial = sp?.get("tutorial") === "1";
  const [openTour, setOpenTour] = useState<boolean>(isTutorial);
  const router = useRouter();

  // Tutorial adımları: Sidebar Section id'leriyle aynı
  const steps = useMemo(
    () => [
      {
        id: "datasource",
        title: "Data Source",
        content:
          "XML URL girip ‘Yükle’ ile ürünleri geçici olarak editöre aktarırsın. (Demo için zorunlu değil.)",
        selector: '[data-tour="datasource"]',
      },
      {
        id: "theme",
        title: "Theme",
        content:
          "Renk, radius, shadow ve font ayarları. Değerler widget CSS değişkenlerine yansır.",
        selector: '[data-tour="theme"]',
      },
      {
        id: "wrapper",
        title: "Wrapper",
        content:
          "Kapsayıcı padding/radius/shadow gibi görünüm ayarları hakkında bilgiler.",
        selector: '[data-tour="wrapper"]',
      },
      {
        id: "product",
        title: "Product",
        content:
          "Kartta görüntülenecek alanları (image/title/badge) açıp kapatabilirsin.",
        selector: '[data-tour="product"]',
      },
      {
        id: "price",
        title: "Price",
        content:
          "Fiyat modunu (indirimli/orijinal) simüle eder. Arayüzde fiyatların gösterimini etkiler.",
        selector: '[data-tour="price"]',
      },
      {
        id: "arrows",
        title: "Arrows",
        content: "Sol/Sağ okların görünürlüğünü yönetir.",
        selector: '[data-tour="arrows"]',
      },
      {
        id: "pagination",
        title: "Pagination",
        content: "Alt sayfa noktalarını (bullets) aç/kapa.",
        selector: '[data-tour="pagination"]',
      },
      {
        id: "anchor",
        title: "Anchor Injection",
        content:
          "Preview açıkken ‘Sayfadan Seç’ ile hedef elementi işaretle; widget hedefin altına enjekte edilir.",
        selector: '[data-tour="anchor"]',
      },
      {
        id: "who",
        title: "Who views",
        content: "Segment kuralları.",
        selector: '[data-tour="who"]',
      },
      {
        id: "where",
        title: "Where views",
        content: "Sayfa/senaryo kapsamı.",
        selector: '[data-tour="where"]',
      },
      {
        id: "when",
        title: "When views",
        content: "Zamanlama/planlama.",
        selector: '[data-tour="when"]',
      },
    ],
    []
  );

  return (
    <EditorProvider>
      <div className="h-[calc(100vh-64px)] w-full flex">
        {/* Sidebar SERBEST scroll */}
        <Sidebar />

        {/* Sağ taraf SERBEST (artık kitlenmiyor) */}
        <main className="flex-1 h-full rounded-r-2xl overflow-auto bg-neutral-800/50 border-l border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h1 className="text-sm text-white/70">Inline • Widget</h1>
            <DeviceBar device={device} setDevice={setDevice} />
          </div>
          <div className="h-[calc(100%-64px)] w-full">
            <Canvas device={device} />
          </div>
        </main>

        {openTour && (
          <TourOverlay
            active
            steps={steps}
            onClose={() => {
              setOpenTour(false);
              router.push("/");
            }}
            onFinish={() => router.push("/")}
          />
        )}
      </div>
    </EditorProvider>
  );
}
