"use client";

import DiscordIcon from "@/components/icons/Discord.svg";
import GithubIcon from "@/components/icons/Github.svg";
import Button from "@/components/inputs/Button";
import Checkbox from "@/components/inputs/Checkbox";
import { useMetadata } from "@/contexts/MetadataContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { type ExternalProvider } from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";

const colors = {
  GitHub:
    "bg-gradient-to-t from-[#121111] to-[#181717] to-50% border-t-[#464545]",
  Discord:
    "bg-gradient-to-t from-[#434db7] to-50% to-[#5865f2] border-t-[#7984f5]",
};

export default function ExternalLink({
  type,
  connection,
}: {
  type: "GitHub" | "Discord";
  connection: ExternalProvider | undefined;
}) {
  const permafrost = usePermafrost();
  const metadata = useMetadata();
  const router = useRouter();
  const notifications = useNotifications();
  const { mutate } = useSWRConfig();

  const [loading, setLoading] = useState(false);

  const beginLinking = async () => {
    setLoading(true);
    const redirectURL = metadata.metadata?.loginOptions.filter(
      (o) => o.type === type.toLowerCase()
    )[0].redirectURL!;

    permafrost.users.externalProviders
      .createConnectionState()
      .then((state) => {
        router.replace(redirectURL.replaceAll("{{state}}", state.state));
      })
      .catch((e) => {
        notifications.fromError(e);
        setLoading(false);
      });
  };

  const disconnect = async () => {
    setLoading(true);

    permafrost.users.externalProviders
      .revoke(type)
      .then(() => {
        mutate("externalConnections");
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
      .setLoginPermission(type, { enabled })
      .then(() => {
        mutate("externalConnections");
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
    <div className="bg-snowflake-gray-3 p-4 rounded-lg flex gap-2 flex-col">
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
        {connection ? (
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
        ) : (
          <Button
            color="success"
            shape="slim"
            variant="flat"
            className="hidden sm:flex"
            disabled={loading}
            onClick={beginLinking}
          >
            Connect
          </Button>
        )}
      </header>
      {connection && (
        <div className="flex sm:flex-row sm:justify-between flex-col items-center justify-center align-top gap-2">
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
