import type { Place } from "./types";

/**
 * Google Maps directions link (from the phone's current location). Works on
 * iPhone and Android, in the Maps app or the browser.
 */
export function directionsUrl(place: Pick<Place, "name" | "address">): string {
  const destination = place.address ? `${place.name}, ${place.address}` : `${place.name}, Orlando, FL`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
