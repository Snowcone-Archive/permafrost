"use client";

import MetadataContext from "@/contexts/MetadataContext";
import NotificationContext from "@/contexts/NotificationContext";
import PermafrostContext from "@/contexts/PermafrostContext";
import SudoContext from "@/contexts/SudoContext";
import DebugMenu from "@/debug/debug";
import "material-symbols/outlined.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setProgress(40);

    window.onload = () => {
      setProgress(100);
    };

    if (document.readyState === "complete") {
      setProgress(100);
    }
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LoadingBar
          color="#207efe"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />

        <noscript className="fixed top-0 backdrop-blur-lg left-0 w-[100vw] h-[100vh] flex items-center justify-center text-center z-50">
          Permafrost requires JavaScript, you goofball. Please enable it. <br />
          Snowflake Software © 2023-2025
        </noscript>

        <PermafrostContext>
          <NotificationContext>
            <MetadataContext>
              <SudoContext>
                {process.env.NODE_ENV === "development" && <DebugMenu />}
                {children}
              </SudoContext>
            </MetadataContext>
          </NotificationContext>
        </PermafrostContext>
      </body>
    </html>
  );
}
