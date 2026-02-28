import type { Metadata, Viewport } from "next";
import { Inter, Amatic_SC } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FeedbackButton } from "@/components/feedback/feedback-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amaticSC = Amatic_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-amatica",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Invoica - Create Professional Invoices",
    template: "%s | Invoica",
  },
  description:
    "Create and send professional invoices in minutes. Supports 9 currencies, PDF export, and works on any device. Free to use.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://invoica.co"
  ),
  icons: {
    icon: "/icon.svg",
  },
  keywords: [
    "invoice",
    "invoicing",
    "invoice generator",
    "free invoice",
    "PDF invoice",
    "send invoice",
    "billing",
    "professional invoice",
    "online invoice",
  ],
  authors: [{ name: "Invoica" }],
  creator: "Invoica",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Invoica - Invoice clients in minutes, not hours",
    description:
      "Create and send professional invoices in minutes. Supports 9 currencies, PDF export, and works on any device.",
    siteName: "Invoica",
    url: "https://invoica.co",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoica - Invoice clients in minutes, not hours",
    description:
      "Create and send professional invoices in minutes. 9 currencies, PDF export, works on any device.",
    site: "@invoica",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${amaticSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SessionProvider>
            {children}
            <FeedbackButton />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
