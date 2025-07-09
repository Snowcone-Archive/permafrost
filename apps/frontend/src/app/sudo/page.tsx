"use client";

import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/Loader";
import { useNotifications } from "@/contexts/NotificationContext";

export default function SudoLoader() {
  const router = useRouter();
  const { continue: continuePath } = useQuery();
  const sudo = useSudo();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const attemptEnableSudo = async () => {
    setLoading(true);
    permafrost.users
      .enableSudo({ password: input })
      .then((res) => {
        sudo.sudoEnabled(res.expires);
        router.push(continuePath || "/dashboard");
      })
      .catch((err) => {
        notifications.fromError(err);
        setLoading(false);
      });
  };

  return (
    <>
      <div
        className={`bg-[#1a1d31] p-6 sm:p-8 rounded-xl flex flex-col gap-4 sm:w-[30rem] w-[calc(100vw-2rem)]`}
      >
        <section>
          <h1 className="text-xl font-bold">Confirm access</h1>
          <p className="text-snowflake-gray-1 leading-5">
            In order to perform this action, you need to verify your identity.
            After verifying, you won&apos;t need to again for 15 minutes.
          </p>
        </section>
        <DatapointArea title="Password" icon={<OutlinedIcon icon="key" />}>
          <Input
            className="mt-1"
            disabled={loading}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onEnter={attemptEnableSudo}
            type="password"
            showHideButton
          />
        </DatapointArea>
      </div>
      <section className="flex gap-4 sm:w-[30rem] w-[calc(100vw-2rem)]">
        <Button
          shape="square"
          color="secondary"
          onClick={() => {
            router.push(continuePath || "/");
          }}
        >
          <OutlinedIcon icon="arrow_back" />
        </Button>
        <Button
          color="primary"
          className="flex-grow"
          disabled={loading}
          onClick={attemptEnableSudo}
        >
          {loading ? <Loader color="#207efe" center /> : "Continue"}
        </Button>
      </section>
    </>
  );
}
