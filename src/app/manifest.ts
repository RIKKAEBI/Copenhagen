import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "社用車予約",
    short_name: "社用車予約",
    description: "社用車の予約システム",
    lang: "ja",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1f6",
    theme_color: "#eef1f6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
