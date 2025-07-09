"use client";

import Button from "@/components/inputs/Button";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import useSWR from "swr";

function EnabledCircle({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <OutlinedIcon icon="check_circle" className="text-snowflake-fg-success" />
  ) : (
    <OutlinedIcon icon="cancel" className="text-snowflake-gray-1" />
  );
}

export default function Management() {
  const permafrost = usePermafrost();
  const sudo = useSudo();
  const notifications = useNotifications();

  const { data, isLoading, error, mutate } = useSWR(
    "configurationSettings",
    () => permafrost.admin.getConfiguration()
  );

  const handleToggleRegistration = async () => {
    if (!data) return;

    sudo
      .requireSudo(() =>
        permafrost.admin.updateConfiguration({
          oauthSignups: !data.oauthSignups,
        })
      )
      .then(() => {
        mutate();
        notifications.create({
          text: `Sign-ups are now ${
            data.oauthSignups ? "disabled" : "enabled"
          }`,
          type: "success",
        });
      })
      .catch((e) => notifications.fromError(e));
  };

  return isLoading || !data ? (
    <Loader center />
  ) : (
    <div>
      <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-4 mt-1 flex place-items-center gap-2">
          <EnabledCircle enabled={data.oauthSignups} />
          OAuth Sign-ups
        </h2>
        <p className="leading-5 text-[#C8CBEA]">
          Disabling sign-ups will prevent new users from registering. This will
          not affect those who have been sent emails to register their accounts.
        </p>

        <div className="flex justify-end mt-2">
          <Button
            color="warning"
            shape="slim"
            variant="flat"
            onClick={handleToggleRegistration}
          >
            {data.oauthSignups ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    </div>
  );
}
