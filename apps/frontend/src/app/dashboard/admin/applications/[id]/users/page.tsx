"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { GetApplicationResponseCollaborator } from "@snowflake-software/permafrost-js";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import BasicUserCard from "./BasicUserCard";

const allowedTypes = ["image/png", "image/apng", "image/gif", "image/jpeg"];

export default function ApplicationProfile() {
  const { id } = useParams<{ id: string }>();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [updating, setUpdating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () =>
      permafrost.applications.get(
        id
      ) as Promise<GetApplicationResponseCollaborator>,
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
        console.log("Will retry");
      },
    }
  );

  const { data: users } = useSWR(
    "application-users-" + id,
    async () => permafrost.applications.getUsers(id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
        console.log("Will retry");
      },
    }
  );

  return (
    <main className="flex flex-col gap-6">
      <DatapointArea
        icon={<OutlinedIcon icon="shield_person" className="text-xl" />}
        title="Owner"
      >
        {data?.owner ? <BasicUserCard user={data?.owner} /> : <Loader center />}
      </DatapointArea>
      <DatapointArea
        icon={<OutlinedIcon icon="group_add" className="text-xl" />}
        title="Collaborators"
      >
        {data?.collaborators.length === 0 &&
          data.collaborators !== undefined && (
            <div className="w-full text-center bg-snowflake-gray-3 text-snowflake-gray-1 p-2 rounded-lg">
              No collaborators
            </div>
          )}
        {data?.collaborators ? (
          data.collaborators.map((collaborator) => (
            <BasicUserCard
              user={collaborator}
              key={collaborator.id}
              deleteFunc={() => {
                setUpdating(true);
                const newCollaborators = data.collaborators.filter(
                  (c) => c.id !== collaborator.id
                );
                permafrost.applications.collaborators
                  .update(id, {
                    remove: [collaborator.id],
                  })
                  .then(() => {
                    mutate({
                      ...data,
                      collaborators: newCollaborators,
                    });
                    notifications.create({
                      type: "success",
                      text: "Collaborator removed",
                    });
                  })
                  .catch((err) => {
                    notifications.fromError(err);
                  })
                  .finally(() => {
                    setUpdating(false);
                  });
              }}
            />
          ))
        ) : (
          <Loader center />
        )}
      </DatapointArea>
      <DatapointArea
        icon={<OutlinedIcon icon="people" className="text-xl" />}
        title="Users"
      >
        {users?.users.length === 0 && users.users !== undefined && (
          <div className="w-full text-center bg-snowflake-gray-3 text-snowflake-gray-1 p-2 rounded-lg">
            No users
          </div>
        )}
        {users?.users ? (
          users.users.map((user) => <BasicUserCard user={user} key={user.id} />)
        ) : (
          <Loader center />
        )}
      </DatapointArea>
    </main>
  );
}
