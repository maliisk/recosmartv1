"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Step = {
  id: string;
  title: string;
  content: string;
  selector?: string; // örn: [data-tour="theme"]
};

type Props = {
  active: boolean;
  steps: Step[];
  onClose: () => void;
  onFinish?: () => void;
};

const TIP_W = 320;
const TIP_H = 120;
const PAD = 8;

export default function TourOverlay({
  active,
  steps,
  onClose,
  onFinish,
}: Props) {
  const STEPS = useMemo(() => steps ?? [], [steps]);
  const [index, setIndex] = useState(0);

  const targetRef = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  function getScrollParent(el: HTMLElement | null) {
    let cur: HTMLElement | null = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const st = window.getComputedStyle(cur);
      if (
        (st.overflowY === "auto" || st.overflowY === "scroll") &&
        cur.scrollHeight > cur.clientHeight
      ) {
        return cur;
      }
      cur = cur.parentElement as HTMLElement | null;
    }
    return null;
  }

  const resolveTarget = () => {
    const sel = STEPS[index]?.selector;
    if (!sel) return null;
    const container = document.querySelector(sel) as HTMLElement | null;
    if (!container) return null;
    return (
      (container.querySelector(
        "button, [data-header], .section-header"
      ) as HTMLElement) || container
    );
  };

  // Hedef konumunu takip et
  useEffect(() => {
    if (!active) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = resolveTarget();
      targetRef.current = el;
      if (el) setRect(el.getBoundingClientRect());
    };
    const onScrollOrResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();

    const sidebar = document.getElementById("editor-sidebar");
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    sidebar?.addEventListener("scroll", onScrollOrResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      sidebar?.removeEventListener("scroll", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index, STEPS]);

  // Adım değişince SADECE sidebar'ı kaydır
  useEffect(() => {
    if (!active) return;
    const el = resolveTarget();
    if (!el) return;

    const sidebar = document.getElementById("editor-sidebar");
    const parent = getScrollParent(el) || sidebar;
    if (parent) {
      const pr = parent.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const delta = er.top - pr.top - parent.clientHeight / 2 + er.height / 2;
      parent.scrollTo({
        top: (parent.scrollTop || 0) + delta,
        behavior: "smooth",
      });
    } else {
      el.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
    }

    const t = setTimeout(() => setRect(el.getBoundingClientRect()), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index]);

  if (!active || !STEPS[index]) return null;
  const progress = Math.round(((index + 1) / Math.max(STEPS.length, 1)) * 100);

  // Tooltip: hedef başlığın SAĞI
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    width: TIP_W,
    minHeight: TIP_H,
    pointerEvents: "auto",
    zIndex: 62,
    top: rect ? Math.max(8, rect.top + rect.height / 2 - TIP_H / 2) : 120,
    left: rect ? rect.left + rect.width + PAD + 14 : 360,
    background: "#111827",
    color: "#fff",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(2,6,23,.25)",
    padding: 12,
  };

  const next = () => setIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
  const prev = () => setIndex((i) => (i > 0 ? i - 1 : i));

  return (
    <>
      {/* Progress bar (inline stil) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(0,0,0,.2)",
          zIndex: 65,
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${progress}%`,
            background: "#0ea5e9",
            transition: "width .2s ease",
          }}
        />
      </div>

      {/* Overlay — etkileşim kilitli DEĞİL, sadece görsel karartma */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          pointerEvents: "none",
          zIndex: 60,
        }}
      >
        {/* Spotlight */}
        {rect && (
          <div
            style={{
              position: "fixed",
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              borderRadius: 12,
              background: "transparent",
              boxShadow: "0 0 0 9999px rgba(0,0,0,.55)",
              outline: "1px solid rgba(255,255,255,.18)",
              pointerEvents: "none",
              zIndex: 61,
            }}
          />
        )}

        {/* Tooltip */}
        <div style={tooltipStyle}>
          {/* sol ok */}
          <span
            style={{
              position: "absolute",
              left: -8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid #111827",
              filter: "drop-shadow(0 0 0.5px rgba(255,255,255,.4))",
            }}
          />
          <h4 style={{ marginBottom: 6 }}>
            {index + 1}/{STEPS.length} — {STEPS[index].title}
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}>
            {STEPS[index].content}
          </p>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={prev}
              disabled={index === 0}
              style={{
                pointerEvents: "auto",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: index === 0 ? "#1f2937" : "transparent",
                color: "#fff",
                opacity: index === 0 ? 0.5 : 1,
                cursor: index === 0 ? "not-allowed" : "pointer",
              }}
            >
              Geri
            </button>
            {index < STEPS.length - 1 ? (
              <button
                onClick={next}
                style={{
                  pointerEvents: "auto",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#0ea5e9",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Devam Et
              </button>
            ) : (
              <button
                onClick={() => (onFinish ? onFinish() : onClose())}
                style={{
                  pointerEvents: "auto",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Bitir
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                marginLeft: "auto",
                pointerEvents: "auto",
                padding: "8px 12px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #334155",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Atla
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
