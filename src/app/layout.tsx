"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./header"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  const hideHeader = pathname === "/";

  return (
    <html lang="ru">
      <head>
        <title>SnapLearn</title>
        <meta name="description" content="SnapLearn готовься с помощью AI" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {!hideHeader && <Header />} 
          {children}
        </Providers>
      </body>
    </html>
  );
}
