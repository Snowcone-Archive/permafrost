"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useMetadata } from "@/contexts/MetadataContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ExternalProvider } from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import Connection from "./Connection";
import ExternalLink from "./ExternalLink";

export default function Connections() {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const router = useRouter();
  const metadata = useMetadata();

  const { data, error, isLoading, mutate } = useSWR(
    () => "connections",
    async () => permafrost.authorizations.list(),
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
    () => "externalConnections",
    async () => permafrost.users.externalProviders.get(),
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
        ) : externalConnectionsError ? (
          externalConnectionsError.error.message ||
          externalConnectionsError.error.code
        ) : (
          <section className="flex flex-col gap-4 mt-2">
            <ExternalLink type="GitHub" connection={githubConnection} />
            <ExternalLink type="Discord" connection={discordConnection} />
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
          <div className="flex items-center justify-center flex-col text-snowflake-gray-1 bg-snowflake-gray-3 p-4 rounded-lg">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              No authorized apps
            </h2>
            <p>Once you authorize some apps, they&apos;ll show up here.</p>
          </div>
        ) : (
          <main className="flex flex-col gap-4">
            {data?.authorizations?.map((authorization) => (
              <Connection
                key={authorization.id}
                authorization={authorization}
                data={data}
                mutate={mutate}
              />
            ))}
          </main>
        )}
      </DatapointArea>
    </>
  );
}
