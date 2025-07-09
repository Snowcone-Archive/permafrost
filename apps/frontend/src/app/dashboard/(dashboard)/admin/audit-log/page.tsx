"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import PaginationButtons from "@/components/PaginationButtons";
import Table, {
  BodyCell,
  BodyRow,
  HeaderCell,
  HeaderRow,
} from "@/components/Table";
import UserSearch from "@/components/UserSearch";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import { usePermafrost } from "@/contexts/PermafrostContext";
import Link from "next/link";
import { useState } from "react";
import Timeago from "react-timeago";
import useSWR from "swr";
import PurgeLogs from "./PurgeLogs";

const tdStyle = "p-2 text-sm";

export default function AuditLog() {
  const permafrost = usePermafrost();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [executingUser, setExecutingUser] = useState<string | null>(null);
  const [perPage, setPerPage] = useState<number>(50);
  const [page, setPage] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const [showPurgePrompt, setShowPurgePrompt] = useState(false);

  const { data, isLoading } = useSWR(
    `audit-log-startDate=${startDate?.toString()}-endDate=${endDate?.toString()}-executingUser=${executingUser}-perPage=${perPage}-page=${page}-sortBy=${sortBy}`,
    () =>
      permafrost.admin.getAuditLog({
        start: startDate || undefined,
        end: endDate || undefined,
        index: page * perPage || 0,
        take: perPage || 0,
        executingUser: executingUser || undefined,
        sortBy,
      })
  );

  return (
    <>
      <PurgeLogs visible={showPurgePrompt} setVisible={setShowPurgePrompt} />
      <main className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 w-full">
          <DatapointArea
            icon={<OutlinedIcon icon="line_start_circle" className="text-xl" />}
            title="Start Date"
          >
            <Input
              type="datetime-local"
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </DatapointArea>
          <DatapointArea
            icon={<OutlinedIcon icon="line_end_circle" className="text-xl" />}
            title="End Date"
          >
            <Input
              type="datetime-local"
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </DatapointArea>
          <DatapointArea
            icon={<OutlinedIcon icon="list" className="text-xl" />}
            title="Amount per Page"
          >
            <Select
              onChange={(e) => setPerPage(Number(e))}
              value={String(perPage)}
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </Select>
          </DatapointArea>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="col-span-2">
            <DatapointArea
              icon={<OutlinedIcon icon="person" className="text-xl" />}
              title="Executing User"
            >
              <UserSearch
                onUserSelect={(user) => setExecutingUser(user ? user.id : null)}
              />
            </DatapointArea>
          </div>
          <DatapointArea
            icon={<OutlinedIcon icon="sort" className="text-xl" />}
            title="Sort By"
          >
            <Select
              onChange={(e) => setSortBy(e as "newest" | "oldest")}
              value={sortBy}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </Select>
          </DatapointArea>
        </div>
        {data !== undefined ? (
          <>
            <Table>
              <thead>
                <HeaderRow>
                  <HeaderCell>Timestamp</HeaderCell>
                  <HeaderCell>User</HeaderCell>
                  <HeaderCell>Affected</HeaderCell>
                  <HeaderCell>Event</HeaderCell>
                </HeaderRow>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <BodyRow key={entry.id}>
                    <BodyCell>
                      <Timeago date={new Date(entry.createdAt)}></Timeago>
                    </BodyCell>
                    <BodyCell>
                      <Link
                        href={`/dashboard/admin/users/${entry.executingUser.id}/account`}
                        className="flex flex-row items-center gap-1"
                      >
                        <ProfilePicture
                          id={entry.executingUser.id}
                          size={"xs"}
                        />
                        {entry.executingUser.username}
                      </Link>
                    </BodyCell>
                    <BodyCell>
                      {entry.type === "user" ? (
                        <Link
                          href={`/dashboard/admin/users/${entry.affectedUser.id}/account`}
                          className="flex flex-row items-center gap-1"
                        >
                          <ProfilePicture
                            id={entry.affectedUser.id}
                            size={"xs"}
                          />
                          {entry.affectedUser.username}
                        </Link>
                      ) : entry.type === "application" ? (
                        <Link
                          href={`/dashboard/admin/applications/${entry.affectedApplication.id}/profile`}
                          className="flex flex-row items-center gap-1"
                        >
                          <ApplicationIcon
                            id={entry.affectedApplication.id}
                            size={"xs"}
                          />
                          {entry.affectedApplication.name}
                        </Link>
                      ) : (
                        "System"
                      )}
                    </BodyCell>
                    <BodyCell>{entry.description}</BodyCell>
                  </BodyRow>
                ))}
              </tbody>
            </Table>
            <PaginationButtons
              page={page}
              pages={Math.ceil(data.total / perPage)}
              setPage={setPage}
            />
            <div>
              <div className="text-center text-sm text-snowflake-gray-1">
                {data.entries.length} items of {data.total} total
              </div>
              <div className="text-center text-sm text-snowflake-gray-1">
                <button
                  className="hover:underline"
                  onClick={() => setShowPurgePrompt(true)}
                >
                  Purge logs
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Loader />
          </>
        )}
      </main>
    </>
  );
}
