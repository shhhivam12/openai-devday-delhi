import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Together — Your community",
  description:
    "A multilingual community relief companion. Ask for help, find saved knowledge, and explore a Himalayan flood and IoT node simulation.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Together", statusBarStyle: "default" },
  icons: { icon: "/brand/mark.svg", apple: "/icon-192.png" },
  themeColor: "#f3f4f4",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
