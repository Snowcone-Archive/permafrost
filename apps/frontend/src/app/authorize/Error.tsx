"use client";

import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import { type DefaultError } from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";

export default function Error({ error }: { error: DefaultError }) {
  const router = useRouter();
  return (
    <>
      <div
        className={`bg-[#1a1d31] p-6 sm:p-12 rounded-xl flex flex-col gap-4 sm:w-[30rem] w-[calc(100vw-2rem)]`}
      >
        <div className="flex flex-row items-center gap-8">
          <div>
            <OutlinedIcon
              icon="warning"
              className={"text-snowflake-fg-warning text-2xl"}
            />
          </div>
          <div>
            The provided authorization link was invalid. If you were sent here
            by a website or a user, please notify them of this issue.
            <div className="text-xs mt-1">{error.error.code}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 w-full">
        <Button
          shape="square"
          color="secondary"
          onClick={() => {
            window.history.go(-1);
          }}
        >
          <OutlinedIcon icon="arrow_back" className="w-6 h-6" />
        </Button>
        <Button
          color="success"
          className="flex-grow"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Go to dashboard
        </Button>
      </div>
    </>
  );
}
