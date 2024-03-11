import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavMenu from "@/components/menu/menu";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Easy Bird ID",
  description:
    "Machine learning powered bird identification - directly in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased font-sans", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <NavMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
