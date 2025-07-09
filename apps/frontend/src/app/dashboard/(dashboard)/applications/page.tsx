"use client";

import Blankslate from "@/components/Blankslate";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import Loader from "@/components/Loader";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { ListApplicationsResponse } from "@snowflake-software/permafrost-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Application from "./Application";

export default function Applications() {
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnly, setShowOnly] = useState<"all" | "owner" | "collaborator">(
    "all"
  );
  const [filteredApplications, setFilteredApplications] = useState<
    ListApplicationsResponse["applications"]
  >([]);

  const { data, error, isLoading, mutate } = useSWR(
    () => "applications",
    async () => {
      return permafrost.applications.list();
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
            if (showOnly === "all") return true;
            if (showOnly === "owner") return app.role === "owner";
            if (showOnly === "collaborator") return app.role === "collaborator";
          })
          .filter((app) =>
            app.name
              .toLocaleUpperCase()
              .includes(searchQuery.toLocaleUpperCase())
          )
      );
    }
  }, [showOnly, data, searchQuery]);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <main className="flex flex-col gap-4">
      <section className="flex sm:flex-row items-center gap-2 flex-col">
        <Input
          placeholder="Search your apps..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
        <div className="flex flex-row gap-2 sm:gap-4 items-center w-full sm:w-auto">
          <Select
            className="sm:!w-40"
            outerClassName="flex-grow sm:flex-grow-0"
            value={showOnly}
            onChange={(value) => {
              setShowOnly(value as "all" | "owner" | "collaborator");
            }}
          >
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="collaborator">Collaborator</option>
          </Select>
          <Link href="/dashboard/applications/new">
            <Button
              shape="slim"
              variant="flat"
              className="w-auto"
              color="success"
              disabled={
                !permafrost.auth.user?.permissions.includes("CreateApplication")
              }
            >
              Create
            </Button>
          </Link>
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
            <div className="flex items-center justify-center flex-col text-snowflake-gray-1 bg-snowflake-gray-3 p-4 rounded-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                No apps found
              </h2>
              <p>
                There aren&apos;t any apps{" "}
                {showOnly === "collaborator"
                  ? "that you collaborate to"
                  : showOnly === "owner"
                  ? "that you own"
                  : ""}
                {searchQuery.length > 0
                  ? ` with the name "${searchQuery}"`
                  : ""}
                .
              </p>
            </div>
          )}
        </>
      ) : (
        <Blankslate
          title="No apps created"
          description="You don't have any apps yet! Get started by clicking the create button above."
        />
      )}
    </main>
  );
}
