import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AppShell } from "@/components/layout/app-shell";
import { StoreProvider } from "@/lib/hooks/use-store";
import { AuthProvider } from "@/lib/hooks/use-auth";
import { LanguageProvider } from "@/lib/i18n/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "Qabul Kalendarim",
  description: "Telegram ichida kalendar, mijozlar va eslatmalar.",
  appleWebApp: {
    capable: true,
    title: "Qabul Kalendarim",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F2F2F7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <AuthProvider>
          <StoreProvider>
            <LanguageProvider>
              <AppShell>{children}</AppShell>
            </LanguageProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
