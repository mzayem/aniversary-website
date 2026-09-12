import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const DESCRIPTION =
  "A little surprise for Shakiba: two years since 13 September, counted, replayed, and promised all over again.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  ),
  title: "13 September — for Shakiba",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: "a little surprise for you, Shakiba",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "a little surprise for you, Shakiba",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#150a1d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${karla.variable}`}>
      <body>{children}</body>
    </html>
  );
}
