import type { Metadata } from "next";
import { Roboto_Slab, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const slab = Roboto_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const reg = IBM_Plex_Mono({
  variable: "--font-reg",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Letter & File Register",
  description: "Track incoming letters and files from receiving desk to disposal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${slab.variable} ${body.variable} ${reg.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
