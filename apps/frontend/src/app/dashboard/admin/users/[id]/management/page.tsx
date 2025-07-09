"use client";

import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Loader from "@/components/Loader";
import Button from "@/components/inputs/Button";
import Select from "@/components/inputs/Select";
import { useState } from "react";
import { useSudo } from "@/contexts/SudoContext";
import DisableAccountPrompt from "./DisableConfirmation";
import DeleteAccountPrompt from "./DeleteConfirmation";

export default function Management() {
  const { id } = useParams();
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const [isSuperAdmin, _] = useState(
    permafrost.auth.user?.permissions.includes("SuperAdministrator")
  );

  const [selectedPermission, setSelectedPermission] = useState<
    string | undefined
  >(undefined);

  const [promptVisible, setPromptVisible] = useState<string | undefined>(
    undefined
  );

  const { data, error, isLoading, mutate } = useSWR(
    "user-" + id,
    async () => permafrost.users.getAsAdmin(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  const removePermission = (permission: string) => {
    if (typeof id !== "string") return;

    sudo
      .requireSudo(() =>
        permafrost.users.updatePermissions(id, {
          remove: [permission],
        })
      )
      .then(() => {
        notifications.create({
          type: "success",
          text: "Permission removed successfully.",
        });
        mutate();
      })
      .catch((err) => notifications.fromError(err));
  };

  const deleteAccount = (permission: string) => {
    if (typeof id !== "string") return;

    sudo
      .requireSudo(() =>
        permafrost.users.updatePermissions(id, {
          add: [permission],
        })
      )
      .then(() => {
        notifications.create({
          type: "success",
          text: "Permission added successfully.",
        });
        mutate();
      })
      .catch((err) => notifications.fromError(err));
  };

  const addPermission = (permission: string) => {
    if (typeof id !== "string") return;

    sudo
      .requireSudo(() =>
        permafrost.users.updatePermissions(id, {
          add: [permission],
        })
      )
      .then(() => {
        notifications.create({
          type: "success",
          text: "Permission added successfully.",
        });
        mutate();
      })
      .catch((err) => notifications.fromError(err));
  };

  const reactivateAccount = () => {
    if (typeof id !== "string") return;

    sudo
      .requireSudo(() => permafrost.users.reactivate(id))
      .then(() => {
        notifications.create({
          type: "success",
          text: "Account reactivated successfully.",
        });
        mutate();
      })
      .catch((err) => notifications.fromError(err));
  };

  const resetProfilePicture = () => {
    if (typeof id !== "string") return;

    permafrost.users.avatar
      .delete(id)
      .then(() => {
        notifications.create({
          type: "success",
          text: "Photo reset successfully.",
        });
        mutate();
      })
      .catch((err) => notifications.fromError(err));
  };

  return isLoading || !data ? (
    <Loader center />
  ) : (
    <div className="flex flex-col gap-4">
      <DisableAccountPrompt
        visible={promptVisible == "disableAccount"}
        setVisible={(value) =>
          setPromptVisible(value ? "disableAccount" : undefined)
        }
      />

      <DeleteAccountPrompt
        visible={promptVisible == "deleteAccount"}
        setVisible={(value) =>
          setPromptVisible(value ? "deleteAccount" : undefined)
        }
      />

      <DatapointArea
        title="Permissions"
        icon={<OutlinedIcon icon="shield_person" />}
      >
        <div className="bg-snowflake-gray-3 p-4 rounded-xl mt-2 flex flex-col gap-2">
          {data.permissions.length === 0 && (
            <span className="italic text-[#C8CBEA]">
              This user has no permissions assigned.
            </span>
          )}
          {data.permissions.map((permission) => (
            <div
              key={permission}
              className="flex flex-row gap-2 items-center justify-between"
            >
              <span className="text-lg font-medium">{permission}</span>
              {(!(
                permission === "Administrator" ||
                permission === "SuperAdministrator"
              ) ||
                isSuperAdmin) && (
                <Button
                  shape="squareSmall"
                  color="danger"
                  variant="flat"
                  onClick={() => {
                    removePermission(permission);
                  }}
                >
                  <OutlinedIcon icon="delete" className="!text-xl" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-row items-center gap-4">
          <Select outerClassName="grow" onChange={setSelectedPermission}>
            {!data.permissions.includes("Administrator") && (
              <option value="Administrator">Administrator</option>
            )}
            {!data.permissions.includes("SuperAdministrator") &&
              isSuperAdmin && (
                <option value="SuperAdministrator">SuperAdministrator</option>
              )}
            {!data.permissions.includes("CreateApplication") && (
              <option value="CreateApplication">CreateApplication</option>
            )}
          </Select>

          <Button
            color="success"
            shape="slim"
            variant="flat"
            disabled={!selectedPermission}
            onClick={() =>
              selectedPermission && addPermission(selectedPermission)
            }
          >
            Grant
          </Button>
        </div>
      </DatapointArea>

      <DatapointArea title="Actions" icon={<OutlinedIcon icon="handyman" />}>
        <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-2 flex flex-col gap-2">
          <h2 className="text-xl font-bold leading-4 mt-1">
            Delete profile picture
          </h2>
          <p className="leading-5 text-[#C8CBEA]">
            If this user has a rather raunchy profile picture, you can reset it
            to the default profile picture here.
          </p>
          <div className="flex justify-end mt-2">
            <Button
              color="warning"
              shape="slim"
              variant="flat"
              onClick={resetProfilePicture}
            >
              Reset
            </Button>
          </div>
        </div>
        {data.flags.includes("Disabled") ? (
          <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2">
            <h2 className="text-xl font-bold leading-4 mt-1">
              Re-activate account
            </h2>
            <p className="leading-5 text-[#C8CBEA]">
              This account was previously disabled. if you reactivate this
              account, this user will be able to login once again. Make sure you
              contact the administrator that disabled this account before
              reactivating.
            </p>
            <div className="flex justify-end mt-2">
              <Button
                color="success"
                shape="slim"
                variant="flat"
                onClick={reactivateAccount}
              >
                Re-activate
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2">
            <h2 className="text-xl font-bold leading-4 mt-1">
              Deactivate account
            </h2>
            <p className="leading-5 text-[#C8CBEA]">
              Prevent logins and user or application actions from this account.
              This will keep user data for an eventual reactivation.
            </p>
            <div className="flex justify-end mt-2">
              <Button
                color="danger"
                shape="slim"
                variant="flat"
                onClick={() => setPromptVisible("disableAccount")}
              >
                Deactivate
              </Button>
            </div>
          </div>
        )}
        <div className="bg-snowflake-gray-3 p-5 rounded-lg mt-4 flex flex-col gap-2 relative">
          <h2 className="text-xl font-bold leading-4 mt-1">Delete account</h2>
          <p className="leading-5 text-[#C8CBEA]">
            This will delete the account and all associated data. This action is
            not reversible. All applications related to this user will need to
            be transferred or deleted before proceeding.
          </p>
          {!isSuperAdmin ? (
            <div className="flex flex-row items-center gap-1">
              <OutlinedIcon
                icon="warning"
                className="text-snowflake-fg-warning !text-2xl"
              />
              <span className="text-sm">
                This action can only be performed by a Super Administrator.
              </span>
            </div>
          ) : data.applications.length > 0 ? (
            <div className="flex flex-row items-center gap-1">
              <OutlinedIcon
                icon="warning"
                className="text-snowflake-fg-warning !text-2xl"
              />
              <span className="text-sm">
                This user has applications associated with it. Please transfer
                or delete them before proceeding.
              </span>
            </div>
          ) : (
            <></>
          )}
          <div className="flex justify-end mt-2">
            <Button
              color="danger"
              shape="slim"
              variant="flat"
              onClick={() => setPromptVisible("deleteAccount")}
              disabled={!isSuperAdmin || data.applications.length > 0}
            >
              Delete
            </Button>
          </div>
        </div>
      </DatapointArea>
    </div>
  );
}
