import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public",
});

export const metadata: Metadata = {
  title: {
    default: "ZUAE — Zimbabwe University Admissions & Enrolment",
    template: "%s · ZUAE",
  },
  description:
    "ZUAE guides local and international students into Zimbabwe's top universities and polytechnics: AI career guidance, document preparation, course matching and Paynow-secured applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${publicSans.variable}`}>
      <body>
        <div className="noise-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
