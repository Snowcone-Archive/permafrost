"use client";

import DeletionConfirmation from "@/components/DeletionConfirmation";
import UserSearch from "@/components/UserSearch";
import Button from "@/components/inputs/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import type { UserPrimitive } from "@snowflake-software/permafrost-js";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export default function ApplicationManagement() {
  const permafrost = usePermafrost();
  const sudo = useSudo();
  const notifications = useNotifications();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(id),
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

  const [selectedTransferUser, setSelectedTransferUser] = useState<
    UserPrimitive | undefined
  >();

  const transfer = () => {
    if (!selectedTransferUser) return;

    if (selectedTransferUser.id === data?.owner.id) {
      notifications.create({
        text: "You cannot transfer an application to its owner.",
        type: "error",
      });
      return;
    }

    sudo
      .requireSudo(() =>
        permafrost.applications.transfer(id as string, {
          to: selectedTransferUser.id,
        })
      )
      .then(() => {
        notifications.create({
          text: "Application transferred successfully.",
          type: "success",
        });
        router.push(`/dashboard/admin/applications/${id}/management`);
      })
      .catch((e) => notifications.fromError(e));
  };

  const resetClientSecret = () => {
    sudo
      .requireSudo(() => permafrost.applications.resetSecret(id))
      .then(() => {
        notifications.create({
          text: "Client secret reset successfully.",
          type: "success",
        });
        router.push(`/dashboard/admin/applications/${id}/management`);
      })
      .catch((e) => notifications.fromError(e));
  };

  const deleteApplication = () => {
    sudo
      .requireSudo(() => permafrost.applications.delete(id))
      .then(() => {
        notifications.create({
          text: "Application deleted successfully.",
          type: "success",
        });
        router.push("/dashboard/admin/applications");
      })
      .catch((e) => notifications.fromError(e));
  };

  return (
    <div>
      <DeletionConfirmation
        visible={showDeleteConfirmation}
        setVisible={setShowDeleteConfirmation}
        onConfirm={deleteApplication}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
      />
      <div className="bg-snowflake-gray-3 p-5 rounded-lg flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-4 mt-1">
          Transfer Application
        </h2>
        <p className="leading-5 text-[#C8CBEA]">
          Transfer the ownership of this application to another user. The user
          that this application is transferred to will have full control over
          this application.
        </p>
        <div>
          <UserSearch
            inputClassName="!bg-[#2E314C]"
            onUserSelect={(user) => setSelectedTransferUser(user)}
            select={selectedTransferUser}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            color="success"
            shape="slim"
            variant="flat"
            disabled={selectedTransferUser === undefined}
            onClick={transfer}
          >
            Transfer
          </Button>
        </div>
      </div>
      <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-4 mt-1">
          Reset Client Secret
        </h2>
        <p className="leading-5 text-[#C8CBEA]">
          Resetting the client secret will invalidate the current client secret
          and generate a new one. The owner of this application will need to
          update the client secret in their application to continue using this
          application.
        </p>
        <div className="flex justify-end mt-2">
          <Button
            color="warning"
            shape="slim"
            variant="flat"
            onClick={resetClientSecret}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-4 mt-1">Delete Application</h2>
        <p className="leading-5 text-[#C8CBEA]">
          Deleting this application will permanently remove it from the system.
          This action cannot be undone.
        </p>
        <div className="flex justify-end mt-2">
          <Button
            color="danger"
            shape="slim"
            variant="flat"
            onClick={() => {
              setShowDeleteConfirmation(true);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
