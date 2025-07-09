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

export default function ApplicationManagement() {
  const permafrost = usePermafrost();
  const sudo = useSudo();
  const notifications = useNotifications();
  const { id } = useParams();
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [selectedTransferUser, setSelectedTransferUser] = useState<
    UserPrimitive | undefined
  >();

  const transfer = () => {
    if (!selectedTransferUser) return;

    if (selectedTransferUser.id === permafrost.auth.user?.id) {
      notifications.create({
        text: "You cannot transfer an application to yourself.",
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
        router.push(`/dashboard/applications/${id}/profile`);
      })
      .catch((e) => notifications.fromError(e));
  };

  const deleteApplication = () => {
    sudo
      .requireSudo(() => permafrost.applications.delete(id as string))
      .then(() => {
        notifications.create({
          text: "Application deleted successfully.",
          type: "success",
        });
        router.push("/dashboard/applications");
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
      <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-2 flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-4 mt-1">
          Transfer Application
        </h2>
        <p className="leading-5 text-[#C8CBEA]">
          Transfer the ownership of this application to another user. The user
          that this application is transferred to will have full control over
          this application. You will remain a collaborator. This action cannot
          be undone.
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
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
