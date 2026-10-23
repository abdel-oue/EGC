import localFont from "next/font/local";
import t from "@egc/shared/admin.json";
import "./globals.css";

const inter = localFont({
  src: "../../../packages/shared/fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
});
const display = localFont({
  src: "../../../packages/shared/fonts/SpaceGrotesk.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: t.title,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
