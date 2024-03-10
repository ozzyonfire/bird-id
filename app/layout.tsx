import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavMenu from "@/components/menu/menu";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Bucket List",
  description: "Infinite canvas drag and drop linked lists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased font-sans bg-background min-h-screen",
          inter.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          <NavMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
