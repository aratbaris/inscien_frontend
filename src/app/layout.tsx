import type { Metadata } from "next";
import { Source_Serif_4, DM_Sans, Source_Code_Pro } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinanceLab | Always-on analysis agents",
  description:
    "Continuous analysis agents across markets, research, and technology.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${dmSans.variable} ${sourceCodePro.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}