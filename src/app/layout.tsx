import "~/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Mono, Libre_Baskerville, Poppins } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["sans-serif"],
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  fallback: ["serif"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "HackUTD 2025",
  description: "HackUTD 2025 Project",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body className="font-sans antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
