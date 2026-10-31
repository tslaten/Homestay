import type { Settings } from "./types";

type Wifi = Settings["wifi"];

/** Escape a value for the WIFI: QR format (backslash, ; , : and " are special). */
function escape(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Payload phones understand when scanning a Wi-Fi QR code, e.g.
 * `WIFI:T:WPA;S:Tricky-Guest;P:secret;;`
 */
export function wifiQrPayload(wifi: Wifi): string {
  const parts = [`T:${wifi.security}`, `S:${escape(wifi.ssid)}`];
  if (wifi.security !== "nopass") parts.push(`P:${escape(wifi.password)}`);
  if (wifi.hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}
