import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

import { TRPCReactProvider } from "~/trpc/react";

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
        <Auth0Provider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
