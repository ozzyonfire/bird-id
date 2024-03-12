import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavMenu from "@/components/menu/menu";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BirdBot",
  description:
    "Machine learning powered bird identification - directly in your browser.",
  appleWebApp: {
    title: "BirdBot",
    capable: true,
    startupImage: `/favicon/icon-512x512.png`,
    statusBarStyle: "default",
  },
  manifest: "/manifest.json",
};

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
      {
        media: "(prefers-color-scheme: dark)",
        color: "hsl(222.2, 84%, 4.9%)",
      },
      {
        media: "(prefers-color-scheme: light)",
        color: "hsl(0, 0%, 100%)",
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased font-sans", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <NavMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
