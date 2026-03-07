import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import { LanguageProvider } from "@/components/language-toggle";
import { ThemeProvider } from "@/components/theme-toggle";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiaryTvideo",
  description: "Your personal space for thoughts and memories",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <div className="flex min-h-screen flex-col">
              <AuthProvider>
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
              </AuthProvider>
            </div>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
