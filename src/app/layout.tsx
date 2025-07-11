// app/layout.tsx
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import "./globals.css"; // Example: your global styles

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
