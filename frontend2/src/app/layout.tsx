
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillmatriX",
  description: "AI‑powered career companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* GLOBAL THEME WRAPPER */}
      <body className="theme-mint">
        {children}
      </body>
    </html>
  );
}
