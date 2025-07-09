"use client";

import EditCollaborators from "@/components/Collaborators";
import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import {
  type GetApplicationResponseCollaborator,
  type UserPrimitive,
} from "@snowflake-software/permafrost-js";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR, { mutate as mutateOne } from "swr";

export default function Collaborators() {
  const { id } = useParams<{ id: string }>();
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const [updating, setUpdating] = useState(false);
  const [collaborators, setCollaborators] = useState<
    UserPrimitive[] | undefined
  >(undefined);
  const [collaboratorsHaveChanged, setCollaboratorsHaveChanged] =
    useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () =>
      permafrost.applications.get(
        id
      ) as Promise<GetApplicationResponseCollaborator>
  );

  const updateCollaborators = () => {
    if (!collaborators) return;

    sudo
      .requireSudo(() =>
        permafrost.applications.collaborators.update(id, {
          set: collaborators?.map((collaborator) => collaborator.id),
        })
      )
      .then((response) => {
        setUpdating(false);
        mutateOne("application-" + id, {
          ...data,
          collaborators: response.collaborators,
        });
        notifications.create({
          type: "success",
          text: "Collaborators updated",
        });
      })
      .catch((err) => {
        notifications.fromError(err);
      });
  };

  return data === undefined && isLoading ? (
    <Loader center />
  ) : data?.role === "owner" ? (
    // Owner view
    <>
      <DatapointArea
        title="Collaborators"
        icon={<OutlinedIcon icon="group" />}
        className="mb-2"
      >
        <p>
          Collaborators have full access to your application info and can manage
          it from their own account.
        </p>
        <p className="mt-2">
          Sensitive actions, like deleting the project or adding new
          collaborators, may only be executed by the application owner (you).
        </p>
        <div className="h-2" />
        <EditCollaborators
          updateCollaborators={(collaborators) => {
            if (collaborators.length === data?.collaborators.length) return;
            setCollaboratorsHaveChanged(true);
            setCollaborators(collaborators);
          }}
          collaborators={data?.collaborators}
        />
      </DatapointArea>

      <div className="w-full flex justify-end gap-3 mt-3">
        <Button
          shape="slim"
          color="success"
          variant="flat"
          disabled={updating || !collaboratorsHaveChanged}
          onClick={updateCollaborators}
        >
          Save
        </Button>
      </div>
    </>
  ) : data ? (
    // Collaborator view
    <>
      <DatapointArea
        title="Collaborators"
        icon={<OutlinedIcon icon="group" />}
        className="mb-2"
      >
        <p>Below is a list of other collaborators on this project.</p>
        <div className="h-2" />
        <div className="flex flex-row gap-2 items-center bg-snowflake-bg-dim p-4 rounded-lg mt-1 justify-between">
          <div className="flex flex-row gap-4 items-center">
            <ProfilePicture id={data?.owner.id} size="lg" />
            <div>
              <div className="text-2xl font-bold leading-5">
                {data.owner.displayName || `@${data.owner.username}`}
              </div>
              {data.owner.displayName && (
                <div className="opacity-50 text-sm leading-4">
                  @{data.owner.username}
                </div>
              )}
            </div>
            <div className="flex gap-1 items-center bg-snowflake-bg-info text-snowflake-fg-info py-1 px-2 rounded-full flex-row text-sm">
              Owner
            </div>
          </div>
        </div>
        {data?.collaborators.map((user) => (
          <div
            key={user.id}
            className="flex flex-row gap-2 items-center bg-snowflake-bg-dim p-4 rounded-lg mt-2 justify-between"
          >
            <div className="flex flex-row gap-4 items-center">
              <ProfilePicture id={user.id} size="lg" />
              <div>
                <div className="text-2xl font-bold leading-5">
                  {user.displayName || `@${user.username}`}
                </div>
                {user.displayName && (
                  <div className="opacity-50 text-sm leading-4">
                    @{user.username}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </DatapointArea>
    </>
  ) : (
    <Loader center />
  );
}
