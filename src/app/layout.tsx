import type { Metadata } from "next";
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
        <ToastContainer />
      </body>
    </html>
  );
}
