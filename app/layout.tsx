import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCWG — The Game",
  description: "The Computer Workshop Group — repair shop game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[var(--tcwg-bg)] text-gray-200">
        {children}
      </body>
    </html>
  );
}
