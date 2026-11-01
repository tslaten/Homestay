import type { MetadataRoute } from "next";

/** Lets phones (and the Echo Show) add the guide to the home screen with Gunter's icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tricky Guest Guide",
    short_name: "Tricky",
    description: "House guide for guests",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf3d9",
    theme_color: "#fdf3d9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
