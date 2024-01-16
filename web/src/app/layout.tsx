import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SocketProvider from "@/contexts/socket-provider";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meme Wars | NSUT.AI",
  description:
    "Use AI to generate memes, have a 1v1 and let other people vote the winner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
