import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STREAM IT! — AI-Powered Radio Broadcast Player",
  description:
    "A futuristic AI-enhanced media player inspired by classic radio broadcasts. Pause, ask, and let AI explain every scene in real time.",
  keywords: ["AI media player", "video AI", "radio design", "stream it", "explain scene"],
  openGraph: {
    title: "STREAM IT! — AI Broadcast Player",
    description: "AI-powered media player with a classic radio aesthetic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain antialiased">
        {children}
      </body>
    </html>
  );
}
