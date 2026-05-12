import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: {
    template: "%s | FloraGuard",
    default: "FloraGuard — AI Plant Disease Detection",
  },
  description:
    "Detect plant diseases instantly using AI. Upload a photo and get actionable treatment recommendations powered by machine learning.",
  keywords: ["plant disease", "AI detection", "crop health", "agriculture", "YOLOv4"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FloraGuard",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
