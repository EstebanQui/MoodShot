import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoodShot",
  description: "A simple MoodShot built with Next.js, Prisma, and PostgreSQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
} 