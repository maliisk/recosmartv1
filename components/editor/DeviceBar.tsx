"use client";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { DEVICES, DeviceKey } from "@/lib/devices";

export default function DeviceBar({
  device,
  setDevice,
}: {
  device: DeviceKey;
  setDevice: (d: DeviceKey) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDevice("desktop")}
          className={`p-2 rounded-xl hover:bg-white/10 ${
            device === "desktop" ? "text-brand" : "text-white/70"
          }`}
          aria-label="Desktop"
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button
          onClick={() => setDevice("tablet")}
          className={`p-2 rounded-xl hover:bg-white/10 ${
            device === "tablet" ? "text-brand" : "text-white/70"
          }`}
          aria-label="Tablet"
        >
          <Tablet className="w-5 h-5" />
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`p-2 rounded-xl hover:bg-white/10 ${
            device === "mobile" ? "text-brand" : "text-white/70"
          }`}
          aria-label="Mobile"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <select
          className="appearance-none bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm pr-9"
          value={device}
          onChange={(e) => setDevice(e.target.value as DeviceKey)}
        >
          {Object.entries(DEVICES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
          ▾
        </div>
      </div>
    </div>
  );
}
