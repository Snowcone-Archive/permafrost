"use client";

import Application from "@/app/dashboard/(dashboard)/admin/applications/Application";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ListApplicationsResponse } from "@snowflake-software/permafrost-js";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Applications() {
  const { id } = useParams();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [ownerSearch, setOwnerSearch] = useState<string | undefined>(undefined);
  const [filteredApplications, setFilteredApplications] = useState<
    ListApplicationsResponse["applications"]
  >([]);

  const { data, error, isLoading, mutate } = useSWR(
    () => "applications",
    async () => {
      return permafrost.applications.list(Array.isArray(id) ? id[0] : id);
    },
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
      },
    }
  );

  useEffect(() => {
    if (data?.applications) {
      setFilteredApplications(
        data.applications.filter((app) =>
          app.name.toLocaleUpperCase().includes(searchQuery.toLocaleUpperCase())
        )
      );
    }
  }, [data, searchQuery]);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <main className="flex flex-col gap-4">
      <section className="flex sm:flex-row items-center gap-2 flex-col">
        <Input
          placeholder="Search by name..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </section>
      {isLoading || !data?.applications ? (
        <Loader center />
      ) : data.applications.length > 0 ? (
        <>
          {filteredApplications.map((app) => (
            <Application app={app} key={app.id} hideOwner />
          ))}
          {filteredApplications.length === 0 && (
            <div>This user has no apps.</div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center flex-col gap-2">
          <p>This user has no applications.</p>
        </div>
      )}
    </main>
  );
}
