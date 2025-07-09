import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import DatapointArea from "@/components/DatapointArea";
import Input from "@/components/inputs/Input";
import Prompt from "@/components/Prompt";
import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import Checkbox from "@/components/inputs/Checkbox";

export default function ChangePasswordPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [deleteOtherSessions, setDeleteOtherSessions] = useState(false);

  const submitPasswordReset = () => {
    permafrost.users
      .updatePassword({
        existing: oldPassword === "" ? undefined : oldPassword,
        new: newPassword,
        otp: twoFactorCode === "" ? undefined : twoFactorCode,
        deleteOtherSessions,
      })
      .catch((e) => {
        notifications.create({
          type: "error",
          text: e.error.message || e.error.code || "Unknown error",
        });
      })
      .then((response) => {
        if (response && response.success) {
          notifications.create({
            type: "success",
            text: "Password changed successfully",
          });

          // TODO: probably add something to update the cached user in permafrost

          setVisible(false);
          resetState();
        }
      });
  };

  const resetState = () => {
    setTimeout(() => {
      setOldPassword("");
      setNewPassword("");
      setTwoFactorCode("");
      setDeleteOtherSessions(false);
    }, 250);
  };

  return (
    <Prompt
      buttons={
        <>
          <Button
            shape="slim"
            color="secondary"
            variant="flat"
            onClick={() => {
              setVisible(false);
              resetState();
            }}
          >
            Cancel
          </Button>
          <Button
            shape="slim"
            color="primary"
            variant="flat"
            onClick={() => {
              submitPasswordReset();
            }}
          >
            Submit
          </Button>
        </>
      }
      visible={visible}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl mb-2">Change Password</h2>
        {permafrost.auth.user?.twoFactorEnabled && (
          <DatapointArea
            icon={<OutlinedIcon icon="key" />}
            title="Two-Factor Authentication Code"
          >
            <Input
              className="mt-1"
              onChange={(e) => {
                setTwoFactorCode(e.target.value);
              }}
              value={twoFactorCode}
            />
          </DatapointArea>
        )}
        {!permafrost.auth.user?.flags.includes("RequiresPasswordChange") && (
          <DatapointArea
            icon={<OutlinedIcon icon="password" />}
            title="Current Password"
          >
            <Input
              className="mt-1"
              showHideButton
              onChange={(e) => {
                setOldPassword(e.target.value);
              }}
              value={oldPassword}
              type="password"
            />
          </DatapointArea>
        )}
        <DatapointArea
          icon={<OutlinedIcon icon="enhanced_encryption" />}
          title="New Password"
        >
          <Input
            className="mt-1"
            showHideButton
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
            value={newPassword}
            type="password"
          />
        </DatapointArea>
        <div className="flex flex-row gap-2">
          <Checkbox
            checked={deleteOtherSessions}
            onChange={(e) => {
              setDeleteOtherSessions(
                (e.currentTarget.ariaChecked as any) === true
              );
            }}
            label="Log out of all accounts"
          />
        </div>
      </div>
    </Prompt>
  );
}
