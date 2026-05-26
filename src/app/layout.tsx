import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { ToastContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Project Creator",
  description: "크리에이터 마케팅 데모",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-size="medium" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
        <ToastContainer />
      </body>
    </html>
  );
}
