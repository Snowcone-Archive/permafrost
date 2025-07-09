import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import DatapointArea from "@/components/DatapointArea";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import Prompt from "@/components/Prompt";
import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";

export default function DisableTwoFactorPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setTimeout(() => {
      setCode("");
    }, 250);
  };

  const disable2fa = () => {
    notifications.create({
      type: "info",
      text: "Disabling...",
    });
    setLoading(true);

    sudo
      .requireSudo(() => permafrost.users.twoFactorAuth.disable({ otp: code }))
      .then(() => {
        notifications.create({
          type: "success",
          text: "Disabled two-factor authentication",
        });
        setVisible(false);
        resetState();

        setLoading(false);
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  return (
    <Prompt
      visible={visible}
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
            color="danger"
            variant="flat"
            disabled={!code || loading}
            onClick={disable2fa}
          >
            {loading ? <Loader color="#ff4f4f" /> : "Disable"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl">
          Disable Two-Factor Authentication
        </h2>
        <DatapointArea
          icon={<OutlinedIcon icon="enhanced_encryption" />}
          title="Two-Factor Authentication Code"
        >
          <Input
            className="mt-1"
            onChange={(e) => {
              setCode(e.target.value);
            }}
            value={code}
          />
        </DatapointArea>
      </div>
    </Prompt>
  );
}
