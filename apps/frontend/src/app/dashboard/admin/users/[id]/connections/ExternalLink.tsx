"use client";

import DiscordIcon from "@/components/icons/Discord.svg";
import GithubIcon from "@/components/icons/Github.svg";
import Button from "@/components/inputs/Button";
import Checkbox from "@/components/inputs/Checkbox";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ExternalProvider } from "@snowflake-software/permafrost-js";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { twMerge } from "tailwind-merge";

const colors = {
  GitHub:
    "bg-gradient-to-t from-[#121111] to-[#181717] to-50% border-t-[#464545]",
  Discord:
    "bg-gradient-to-t from-[#434db7] to-50% to-[#5865f2] border-t-[#7984f5]",
};

export default function ExternalLink({
  type,
  connection,
  id,
}: {
  type: "GitHub" | "Discord";
  connection: ExternalProvider | undefined;
  id: string;
}) {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const disconnect = async () => {
    setLoading(true);

    permafrost.users.externalProviders
      .revoke(type, id)
      .then(() => {
        mutate("externalConnections-" + id);
        notifications.create({
          type: "success",
          text: "Successfully disconnected.",
        });
        setLoading(false);
      })
      .catch((e) => {
        notifications.fromError(e);
        setLoading(false);
      });
  };

  const enableLogin = async (enabled: boolean) => {
    setLoading(true);

    permafrost.users.externalProviders
      .setLoginPermission(type, { enabled }, id)
      .then(() => {
        mutate("externalConnections-" + id);
        notifications.create({
          type: "success",
          text: "Successfully updated login permission.",
        });
        setLoading(false);
      })
      .catch((e) => {
        notifications.fromError(e);
        setLoading(false);
      });
  };

  return (
    <div
      className={twMerge(
        "bg-snowflake-gray-3 p-4 rounded-lg flex gap-2 flex-col",
        connection ? "opacity-100" : "opacity-50"
      )}
    >
      <header className="flex justify-center sm:justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <div
            style={{
              boxShadow:
                "0px 0px 0px 1px rgba(0, 0, 0, 0.25), var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
            }}
            className={
              colors[type] + " border-t  p-2 rounded-lg aspect-square flex"
            }
          >
            {type === "Discord" ? (
              <DiscordIcon
                style={{
                  width: "1.5rem",
                }}
              />
            ) : (
              <GithubIcon className="w-6 h-6" />
            )}
          </div>
          <h2 className="font-bold text-xl">{type}</h2>
        </div>
        {connection && (
          <Button
            color="danger"
            shape="slim"
            variant="flat"
            className="hidden sm:flex"
            disabled={loading}
            onClick={disconnect}
          >
            Disconnect
          </Button>
        )}
      </header>
      {connection && (
        <div className="flex sm:flex-row sm:justify-between flex-col justify-center items-center align-top gap-2">
          <Checkbox
            label="Allow logins"
            checked={connection.enableLogin}
            onChange={(e) =>
              enableLogin(e.currentTarget.ariaChecked as any as boolean)
            }
            small
          />

          <span className="gap-2 opacity-25 text-sm leading-4 flex flex-row items-end">
            {connection.platformUsername} • {connection.platformId}
          </span>
        </div>
      )}
    </div>
  );
}
