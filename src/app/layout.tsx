import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "社用車予約",
  description: "社用車の予約システム",
  appleWebApp: {
    capable: true,
    title: "社用車予約",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#eef1f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
