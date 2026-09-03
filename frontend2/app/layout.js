import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "meSSET — Digital Mess Card",
  description: "A digital mess-card and meal tracking system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
