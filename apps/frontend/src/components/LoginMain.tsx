"use client";

import Background from "@/assets/login-bg.jpg";
import { useMetadata } from "@/contexts/MetadataContext";
import Image from "next/image";
import StatusIndicator from "./StatusIndicator";
import PermafrostIcon from "./icons/Permafrost.svg";
import SnowflakeIcon from "./icons/Snowflake.svg";

export default function LoginMain({ children }: { children: React.ReactNode }) {
  const metadata = useMetadata();

  return (
    <>
      <Image
        src={Background}
        alt=""
        className="w-full h-[calc(100dvh)] object-cover fixed top-0 left-0 z-[-1] transition-all duration-500 ease-in-out"
        width={4032}
        height={3024}
        placeholder="blur"
      />

      <main className="overflow-hidden fixed w-full">
        <div className="h-[calc(100dvh)] bg-[#2F3258ef] lg:bg-[#2F3258BF]">
          <div className="h-full bg-[#0004] flex flex-row justify-center lg:!justify-between">
            <main
              className="h-full px-8 py-12 max-w-lg lg:pl-24 flex flex-col justify-center flex-grow lg:bg-gradient-to-r lg:from-[#17192C] lg:from-40% lg:to-[#17192c00]"
              style={
                {
                  //background:
                  //"linear-gradient(90deg, #17192C 40.63%, rgba(23, 25, 44, 0.00) 100%)",
                }
              }
            >
              <div className="flex flex-col justify-between h-full gap-8 md:!h-[70%]">
                <header className="flex flex-row items-center gap-4 justify-center lg:!justify-start">
                  <PermafrostIcon
                    className="w-16 h-16 border-t-[1px] border-t-[#FFF4] rounded-xl border-b-[1px] border-b-[#0004]"
                    style={{
                      boxShadow: "0px 5px 50px 05px rgba(0, 0, 0, 0.25)",
                    }}
                  />

                  <h1 className="text-4xl font-bold">Permafrost</h1>
                </header>
                {children}
              </div>
              <div className="flex justify-between items-center mt-2 lg:hidden">
                <div className="flex flex-row justify-center items-center">
                  <div className="text-[#207EFE] text-base font-bold leading-4 flex flex-row items-center gap-1">
                    <SnowflakeIcon className="w-4 h-4" />
                    Snowflake
                  </div>
                </div>
                <div className="flex flex-row justify-center gap-2 items-center text-sm">
                  <div className="opacity-50">
                    Photo by{" "}
                    <a className="hover:underline" href="https://znepb.me">
                      znepb
                    </a>
                  </div>
                  <StatusIndicator />
                </div>
              </div>
            </main>
            <div className="p-16 flex-col justify-between items-end hidden lg:flex">
              <div className="opacity-50">
                Photo by{" "}
                <a className="hover:underline" href="https://znepb.me">
                  znepb
                </a>
              </div>
              <div className="flex flex-col items-end">
                <div className="opacity-50 leading-4">Made by</div>
                <div className="text-[#207EFE] text-2xl font-bold leading-4 flex flex-row items-center gap-1">
                  <SnowflakeIcon className="w-7 h-7" />
                  Snowflake
                </div>
                <div className="opacity-50 mt-0 mb-2 text-sm">
                  Snowflake Software © 2023-2025
                </div>
                <StatusIndicator />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
