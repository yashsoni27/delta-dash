import "./globals.css";
import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import LayoutWrapper from "@/components/layout/LayoutWrapper";


// const myFont = Titillium_Web({ weight: ["200", "300", "400", "600", "700", "900"], subsets: ["latin"] });
const myFont = localFont({
  src: "../../public/fonts/Formula1.otf",
  weight: "100",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Delta Dash",
  description: "Formula 1 analysis dashboard",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={myFont.className}>
        <LayoutWrapper navbar={<Navbar />} footer={<Footer />}>
          {children}
        </LayoutWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
