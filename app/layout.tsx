import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { SITE_BRAND } from "@/lib/site-brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_BRAND.name,
    template: `%s | ${SITE_BRAND.name}`,
  },
  description: SITE_BRAND.description,
  icons: {
    icon: [{ url: SITE_BRAND.faviconSrc, type: "image/png" }],
    apple: [{ url: SITE_BRAND.faviconSrc, type: "image/png" }],
    shortcut: SITE_BRAND.faviconSrc,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-clip">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
