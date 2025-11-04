export type DeviceKey = "desktop" | "tablet" | "mobile";

type DeviceSpec = {
  label: string;
  width: number;
  height: number; // <-- eklendi
};

export const DEVICES: Record<DeviceKey, DeviceSpec> = {
  desktop: { label: "Desktop", width: 1280, height: 800 },
  tablet: { label: "Tablet", width: 834, height: 1112 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

export const DEVICE_KEYS: DeviceKey[] = ["desktop", "tablet", "mobile"];
