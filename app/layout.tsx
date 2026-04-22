import type { Metadata } from "next";
import { Roboto } from "next/font/google"; 
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Nhân lực Điều dưỡng",
  description: "Hệ thống quản lý nhân sự điều dưỡng bệnh viện chuyên nghiệp",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${roboto.variable} min-h-full font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
