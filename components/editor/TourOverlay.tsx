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
  };

  const next = () => setIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
  const prev = () => setIndex((i) => (i > 0 ? i - 1 : i));

  return (
    <>
      {/* Progress bar */}
      <div className="tour-progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      {/* Overlay — etkileşim kilitli DEĞİL, sadece görsel karartma */}
      <div
        className="tour-overlay"
        style={{ pointerEvents: "none", background: "rgba(0,0,0,.45)" }}
      >
        {/* Spotlight (ikinci kart yok, sadece maske) */}
        {rect && (
          <div
            className="tour-spotlight"
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
        <div className="tour-tooltip arrow-right" style={tooltipStyle}>
          {/* sol ok (tek) */}
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

          <div className="tour-actions" style={{ marginTop: 12 }}>
            <button
              className="tour-btn"
              onClick={prev}
              disabled={index === 0}
              style={{ pointerEvents: "auto" }}
            >
              Geri
            </button>
            {index < STEPS.length - 1 ? (
              <button
                className="tour-btn primary"
                onClick={next}
                style={{ pointerEvents: "auto" }}
              >
                Devam Et
              </button>
            ) : (
              <button
                className="tour-btn primary"
                onClick={() => (onFinish ? onFinish() : onClose())}
                style={{ pointerEvents: "auto" }}
              >
                Bitir
              </button>
            )}
            <button
              className="tour-btn"
              onClick={onClose}
              style={{ marginLeft: "auto", pointerEvents: "auto" }}
            >
              Atla
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
