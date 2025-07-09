"use client";

import DatapointArea from "@/components/DatapointArea";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useMetadata } from "@/contexts/MetadataContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ExternalProvider } from "@snowflake-software/permafrost-js";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import ExternalLink from "./ExternalLink";

export default function Connections() {
  const { idParam } = useParams();
  const id = idParam!;
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const router = useRouter();
  const metadata = useMetadata();

  const { data, error, isLoading, mutate } = useSWR(
    () => `connections-${Array.isArray(id) ? id[0] : id}`,
    async () => permafrost.authorizations.list(Array.isArray(id) ? id[0] : id),
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

  const {
    data: externalConnections,
    error: externalConnectionsError,
    isLoading: externalConnectionsLoading,
    mutate: externalConnectionsMutate,
  } = useSWR(
    () => `externalConnections-${Array.isArray(id) ? id[0] : id}`,
    async () =>
      permafrost.users.externalProviders.get(Array.isArray(id) ? id[0] : id),
    {
      onSuccess: (data) => {
        setGithubConnection(data.filter((c) => c.platform === "GitHub")[0]);
        setDiscordConnection(data.filter((c) => c.platform === "Discord")[0]);
      },
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
        console.log("Will retry");
      },
    }
  );

  const [githubConnection, setGithubConnection] = useState<
    ExternalProvider | undefined
  >(externalConnections?.filter((c) => c.platform === "GitHub")[0]);
  const [discordConnection, setDiscordConnection] = useState<
    ExternalProvider | undefined
  >(externalConnections?.filter((c) => c.platform === "Discord")[0]);
  return (
    <>
      <DatapointArea
        title="External connections"
        icon={<OutlinedIcon icon="captive_portal" />}
      >
        {externalConnectionsLoading || !externalConnections ? (
          <Loader center />
        ) : error ? (
          externalConnectionsError.error.message ||
          externalConnectionsError.error.code
        ) : (
          <section className="flex flex-col gap-4 mt-2">
            <ExternalLink
              type="GitHub"
              connection={githubConnection}
              id={Array.isArray(id) ? id[0] : id}
            />
            <ExternalLink
              type="Discord"
              connection={discordConnection}
              id={Array.isArray(id) ? id[0] : id}
            />
          </section>
        )}
      </DatapointArea>
      <div className="h-8" />
      <DatapointArea
        title="Authorized apps"
        className="mb-2"
        icon={<OutlinedIcon icon="domain_verification" />}
      >
        {isLoading || !data?.authorizations ? (
          <Loader center />
        ) : error ? (
          error.error.message || error.error.code
        ) : data?.authorizations.length === 0 ? (
          <div>This user has not authorized any applications.</div>
        ) : (
          <main className="flex flex-col gap-4">
            {data.authorizations.map((authorization) => (
              <div
                className="bg-snowflake-gray-3 p-4 rounded-lg flex gap-2 flex-col"
                key={authorization.id}
              >
                <header className="flex justify-center sm:justify-between items-center">
                  <section className="flex flex-row gap-3 items-center">
                    <ApplicationIcon
                      id={authorization.application.id}
                      size="lg"
                    />
                    <h1 className="text-3xl font-bold">
                      {authorization.application.name}
                    </h1>
                  </section>
                </header>
                <section className="grid sm:grid-cols-3 gap-2">
                  <DatapointArea
                    icon={
                      <OutlinedIcon icon="calendar_month" className="text-lg" />
                    }
                    title="Authorized"
                  >
                    {new Date(authorization.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </DatapointArea>
                  <DatapointArea
                    icon={<OutlinedIcon icon="group" className="text-lg" />}
                    title="Total Users"
                  >
                    {authorization.application.authorizations} user
                    {authorization.application.authorizations !== 1 ? "s" : ""}
                  </DatapointArea>
                  <DatapointArea
                    icon={<OutlinedIcon icon="build" className="text-lg" />}
                    title="Creator"
                  >
                    <div className={"flex flex-row gap-2 items-center"}>
                      <ProfilePicture
                        id={authorization.application.owner.id}
                        size="xs"
                      />

                      <span>@{authorization.application.owner.username}</span>
                    </div>
                  </DatapointArea>
                </section>
                <DatapointArea
                  icon={<OutlinedIcon icon="tune" className="text-lg" />}
                  title="Scopes"
                >
                  <section className="bg-[#383b55] lg:grid lg:grid-cols-2 flex flex-col gap-2 rounded-lg px-3 py-2 mt-1">
                    {authorization.scopes.map((scope) => (
                      <div key={scope} className="flex items-center gap-2">
                        <span className="text-[#898DAE77]">•</span> {scope}
                      </div>
                    ))}
                  </section>
                </DatapointArea>
              </div>
            ))}
          </main>
        )}
      </DatapointArea>
    </>
  );
}
