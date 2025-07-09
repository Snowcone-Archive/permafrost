"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Input from "@/components/inputs/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useParams } from "next/navigation";
import useSWR from "swr";
import UserFlag from "../UserFlags";
import { useState } from "react";
import Button from "@/components/inputs/Button";
import { useSudo } from "@/contexts/SudoContext";
import { censorEmailAddress } from "@/utils/general";

function EnabledCircle({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <OutlinedIcon icon="check_circle" className="text-snowflake-fg-success" />
  ) : (
    <OutlinedIcon icon="cancel" className="text-snowflake-gray-1" />
  );
}

export default function UserAccount() {
  const { id } = useParams();
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const { data, error, isLoading, mutate } = useSWR(
    "user-" + id,
    async () => permafrost.users.getAsAdmin(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onSuccess(data) {
        setDisplayName(data.displayName);
        setPrevDisplayName(data.displayName);
        setUsername(data.username);
        setPrevUsername(data.username);
      },
    }
  );

  const [displayName, setDisplayName] = useState<string | undefined>(
    permafrost.auth.user?.displayName
  );
  const [prevDisplayName, setPrevDisplayName] = useState(
    data?.displayName || ""
  );

  const [username, setUsername] = useState(data?.username || "");
  const [prevUsername, setPrevUsername] = useState(data?.username || "");

  const update = () => {
    if (permafrost.auth.user == undefined) return;
    if (displayName == undefined || username == undefined) return;
    if (displayName == prevDisplayName && username == prevUsername) return;

    sudo
      .requireSudo(() =>
        permafrost.users.update(
          {
            username: username !== prevUsername ? username : undefined,
            displayName:
              displayName !== prevDisplayName ? displayName : undefined,
          },
          Array.isArray(id) ? id[0] : id
        )
      )
      .then((resp) => {
        if (!resp) return;
        setPrevDisplayName(displayName);
        setPrevUsername(username);

        permafrost.auth.user!.displayName = displayName;
        permafrost.auth.user!.username = username;

        notifications.create({
          type: "success",
          text:
            displayName !== prevDisplayName && username !== prevUsername
              ? "Updated information successfully"
              : displayName !== prevDisplayName
              ? "Updated display name successfully"
              : "Updated username successfully",
        });
        mutate();
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  return data ? (
    <div className="flex flex-col gap-4">
      <DatapointArea
        title="Identity"
        icon={<OutlinedIcon icon="account_circle" />}
      >
        <section className="flex flex-row gap-3 items-center mt-2 justify-between">
          <div className="flex flex-row gap-3 items-center">
            <ProfilePicture id={Array.isArray(id) ? id[0] : id} size="lg" />
            <div>
              <h1 className="text-3xl font-bold leading-7">
                {data.displayName}
              </h1>
              <h3 className="text-snowflake-gray-1 leading-4">
                @{data.username}
              </h3>
            </div>
          </div>
          <UserFlag user={data} />
        </section>
      </DatapointArea>
      <DatapointArea icon={<OutlinedIcon icon="sell" />} title="Display Name">
        <Input
          value={displayName}
          className="mt-1"
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
        />
      </DatapointArea>

      <DatapointArea icon={<OutlinedIcon icon="person" />} title="Username">
        <Input
          value={username}
          className="mt-1 lowercase"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </DatapointArea>
      <DatapointArea title="E-Mail" icon={<OutlinedIcon icon="mail" />}>
        <Input
          value={censorEmailAddress(data.email)}
          readOnly
          copyable
          className="mt-1"
        />
      </DatapointArea>
      <DatapointArea
        title="Security"
        icon={<OutlinedIcon icon="enhanced_encryption" />}
      >
        <div className="p-4 bg-snowflake-gray-3 rounded-xl mt-1">
          <section className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-lg">Two-factor authentication</span>
              <EnabledCircle enabled={data.twoFactorEnabled} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg">Connected sessions</span>
              <span className="text-snowflake-fg-dim text-lg">
                {data.sessions.length}
              </span>
            </div>
          </section>
        </div>
      </DatapointArea>
      <DatapointArea title="Flags" icon={<OutlinedIcon icon="tune" />}>
        <div className="p-4 bg-snowflake-gray-3 rounded-xl mt-1">
          <section className="flex flex-col gap-2">
            {data.flags.length === 0 && (
              <span className="text-snowflake-gray-1">
                This user has no flags.
              </span>
            )}
            {data.flags.map((flag) => {
              return (
                <div key={flag}>
                  <span className="text-snowflake-gray-1">•</span>{" "}
                  <span>{flag}</span>
                </div>
              );
            })}
          </section>
        </div>
      </DatapointArea>
      <div className="w-full flex justify-end gap-3 mt-3">
        <Button
          shape="slim"
          color="success"
          variant="flat"
          onClick={update}
          disabled={
            !displayName ||
            !username ||
            (displayName == prevDisplayName && username == prevUsername)
          }
        >
          Save
        </Button>
      </div>
    </div>
  ) : (
    <Loader center />
  );
}
