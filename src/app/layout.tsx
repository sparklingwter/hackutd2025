import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { CompareProvider } from "~/components/comparison/CompareContext";
import { CompareTray } from "~/components/comparison/CompareTray";

export const metadata: Metadata = {
  title: "Toyota Vehicle Shopping Experience",
  description: "AI-powered vehicle discovery and recommendations",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <CompareProvider>
            {children}
            <CompareTray />
          </CompareProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
