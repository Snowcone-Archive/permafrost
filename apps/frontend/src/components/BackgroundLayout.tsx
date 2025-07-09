import Background from "@/assets/login-bg.jpg";
import Image from "next/image";
import type { ReactNode } from "react";
import StatusIndicator from "./StatusIndicator";
import PermafrostIcon from "./icons/Permafrost.svg";
import SnowflakeIcon from "./icons/Snowflake.svg";

export default function BackgroundLayout({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  return (
    <>
      <Image
        src={Background}
        alt=""
        className="w-full h-full object-cover fixed top-0 left-0 z-[-1] transition-all duration-500 ease-in-out"
        width={4032}
        height={3024}
        placeholder="blur"
      />
      <main className="h-[100vh]">
        <div className="h-[100vh] bg-[#2F3258BF]">
          <div className="h-[100vh] bg-[#0004] flex flex-row justify-between">
            <div className="flex-col justify-end h-ful m-8 hidden sm:flex">
              <StatusIndicator />

              <div className="opacity-50 leading-4">Made by</div>
              <div className="text-[#207EFE] text-2xl font-bold leading-4 flex flex-row items-center gap-1">
                <SnowflakeIcon className="w-7 h-7" />
                Snowflake
              </div>
              <div className="opacity-50 mt-0 text-sm">
                Snowflake Software © 2023-2025
              </div>
            </div>
            <main className="h-[100vh] inline-flex flex-col items-center justify-center gap-4 w-auto absolute left-[50%] translate-x-[-50%]">
              <header className="flex flex-row items-center gap-4">
                <PermafrostIcon
                  className="w-16 h-16 border-t-[1px] border-t-[#FFF4] rounded-xl border-b-[1px] border-b-[#0004]"
                  style={{ boxShadow: "0px 5px 50px 05px rgba(0, 0, 0, 0.25)" }}
                />
                <h1 className="text-4xl font-bold">Permafrost</h1>
              </header>
              {children}
            </main>
            <div className="justify-end h-[calc(100vh - 16rem)] m-8 opacity-50 justify-end flex-col hidden sm:flex">
              <div>
                Photo by{" "}
                <a className="hover:underline" href="https://znepb.me">
                  znepb
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
