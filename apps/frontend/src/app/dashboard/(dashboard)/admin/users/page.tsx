"use client";

import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useWindowSize } from "@uidotdev/usehooks";
import { useState } from "react";
import useSWR from "swr";
import CreateUserPopup from "./CreatePopup";
import User from "./User";

export default function AdminUsers() {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const { width } = useWindowSize();

  const compact = (width || 0) < 500;
  const [createUserVisible, setCreateUserVisible] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "allUsers",
    () => permafrost.users.getAll(),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  return (
    <main className="flex flex-col gap-4">
      <CreateUserPopup
        visible={createUserVisible}
        setVisible={setCreateUserVisible}
      />
      <section className="flex flex-row items-center gap-4">
        <Input placeholder="Search users..." />
        <Button
          shape="slim"
          variant="flat"
          className="max-w-4xl sm:w-40"
          color="success"
          onClick={() => setCreateUserVisible(true)}
        >
          {compact ? <OutlinedIcon icon="person_add" /> : "Invite user"}
        </Button>
      </section>
      {isLoading || !data?.users ? (
        <Loader center />
      ) : (
        <>
          {data.users.map((user) => (
            <User key={user.id} user={user} />
          ))}
        </>
      )}
    </main>
  );
}
