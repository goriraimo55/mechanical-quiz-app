import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kosen Tech Quest",
  description: "高専生向け 技術クエスト型学習・仕事マッチングWebアプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body>{children}</body>
    </html>
  );
}
