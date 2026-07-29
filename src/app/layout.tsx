import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mão na Roda Ubatuba",
  description: "Ofertas reais com prova de foto e GPS",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}