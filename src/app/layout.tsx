// src/app/layout.tsx
import { ReactNode } from "react";
import Providers from "@/components/providers/Providers";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
