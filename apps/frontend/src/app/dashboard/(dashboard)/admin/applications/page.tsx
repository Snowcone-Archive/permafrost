"use client";

import Blankslate from "@/components/Blankslate";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import UserSearch from "@/components/UserSearch";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ListApplicationsResponse } from "@snowflake-software/permafrost-js";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Application from "./Application";

export default function Applications() {
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [ownerSearch, setOwnerSearch] = useState<string | undefined>(undefined);
  const [filteredApplications, setFilteredApplications] = useState<
    ListApplicationsResponse["applications"]
  >([]);

  const { data, error, isLoading, mutate } = useSWR(
    () => "all-applications",
    async () => {
      return permafrost.applications.listAll();
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
        data.applications
          .filter((app) => {
            return ownerSearch ? app.owner.id === ownerSearch : true;
          })
          .filter((app) =>
            app.name
              .toLocaleUpperCase()
              .includes(searchQuery.toLocaleUpperCase())
          )
      );
    }
  }, [ownerSearch, data, searchQuery]);

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
        <div className="flex flex-row gap-2 sm:gap-4 items-center w-full sm:w-auto">
          <div className="w-64">
            <UserSearch
              inputClassName=""
              onUserSelect={(selected) => {
                setOwnerSearch(selected?.id);
              }}
            />
          </div>
        </div>
      </section>
      {isLoading || !data?.applications ? (
        <Loader center />
      ) : data.applications.length > 0 ? (
        <>
          {filteredApplications.map((app) => (
            <Application app={app} key={app.id} />
          ))}
          {filteredApplications.length === 0 && (
            <div className="flex items-center justify-center flex-col gap-2">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <OutlinedIcon icon="deployed_code" className="!text-3xl" />
                No apps found!
              </h2>
              <p>No applications found with these details.</p>
            </div>
          )}
        </>
      ) : (
        <Blankslate
          title="No apps created"
          description="There are no applications right now."
        />
      )}
    </main>
  );
}
