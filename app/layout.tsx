import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas",
  description: "Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!",
  keywords: ["igreja", "batista", "vila canaan", "duque de caxias", "PIB", "cultos", "evangelica"],
  authors: [{ name: "PIB Vila Canaan" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://pibvilacanaan.com.br",
    siteName: "PIB Vila Canaan",
    title: "PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas",
    description: "Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PIB Vila Canaan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas",
    description: "Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
        </Providers>
      </body>
    </html>
  );
}
