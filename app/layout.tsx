import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Living Line | Immersive Scrollytelling Experience",
  description: "An organic, cinematic journey through digital space. Experience the power of the living line.",
  keywords: ["scrollytelling", "immersive", "animation", "creative", "portfolio"],
  authors: [{ name: "Dika" }],
  openGraph: {
    title: "The Living Line | Immersive Scrollytelling Experience",
    description: "An organic, cinematic journey through digital space.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
