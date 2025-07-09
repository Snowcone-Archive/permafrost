"use client";

import Loader from "@/components/Loader";

export default function BackgroundLayoutLoader() {
  return (
    <div
      className={`bg-[#1a1d31] p-6 sm:p-12 rounded-xl flex flex-col gap-4 sm:w-[30rem] w-[calc(100vw-2rem)] items-center`}
    >
      <Loader></Loader>
    </div>
  );
}
