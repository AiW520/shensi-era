import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "神思纪｜东方神话智能文明",
  description: "一场东方神话与人工智能共同书写的未来文明叙事。",
  keywords: ["东方幻想", "人工智能", "数字文明", "国风", "神话"],
  openGraph: { title: "神思纪｜东方神话智能文明", description: "当古老神话第一次拥有计算的能力。", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#050b0d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
