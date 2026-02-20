import AppProvidersWrapper from "@/components/wrappers/AppProvidersWrapper";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Image from "next/image";
import NextTopLoader from "nextjs-toploader";
import "@/assets/scss/app.scss";
import "./globals.css";
import { DEFAULT_PAGE_TITLE } from "@/context/constants";
const logoDark = "/logo-dark.png";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Casa Nirvana - Society Management System",
    default: DEFAULT_PAGE_TITLE,
  },
  description:
    "A comprehensive society management system for residential communities - Casa Nirvana Admin Portal",
};

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.7s ease;
  overflow: hidden;
}

#splash-screen.remove {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
      </head>
      <body className={figtree.className} suppressHydrationWarning>
        <div id="splash-screen">
          <Image
            alt="Logo"
            width={112}
            height={24}
            src={logoDark}
            priority
            style={{
              maxHeight: '6%',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
        <NextTopLoader color="#604ae3" showSpinner={false} />
        <div id="__next_splash">
          <AppProvidersWrapper>{children}</AppProvidersWrapper>
        </div>
      </body>
    </html>
  );
}
