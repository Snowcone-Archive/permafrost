import DeletionConfirmation from "@/components/DeletionConfirmation";
import { HumanDate } from "@/components/HumanDate";
import Button from "@/components/inputs/Button";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import type { Passkey } from "@snowflake-software/permafrost-js";
import { useContext, useState } from "react";
import { PasskeyContext } from "./PasskeyContext";

export type PasskeyTransports = Passkey["transports"][number];
export const PasskeyIcons: { [key in PasskeyTransports]: string } = {
  ble: "bluetooth",
  cable: "cable",
  hybrid: "qr_code",
  internal: "fingerprint",
  nfc: "contactless",
  "smart-card": "nfc",
  usb: "security_key",
};

export default function PasskeyEntry(props: { passkey: Passkey }) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const [showRemovalConfirmation, setShowRemovalConfirmation] = useState(false);

  const { passkey } = props;
  const { mutate, setRenamingID, setRenamingCurrentName } =
    useContext(PasskeyContext);

  const deletePasskey = () => {
    sudo
      .requireSudo(() => permafrost.users.passkeys.delete(passkey.id))
      .then(() => {
        notifications.create({
          type: "success",
          text: "Passkey removed",
        });
        mutate();
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  return (
    <section className="bg-snowflake-gray-3 p-4 rounded-xl flex flex-row justify-between items-center">
      <DeletionConfirmation
        title="Remove Passkey"
        message="Are you sure you want to remove this passkey?"
        visible={showRemovalConfirmation}
        onConfirm={deletePasskey}
        setVisible={setShowRemovalConfirmation}
      />

      <section className="flex items-center flex-row gap-3">
        <div
          className="w-10 h-10 bg-[#2F314B] bg-gradient-to-b rounded-xl border-t border-t-[#ffffff20] from-[#00000000] via-[#00000000] to-[#00000020] flex items-center justify-center"
          style={{
            boxShadow:
              "0px 0px 0px 1px rgba(0, 0, 0, 0.25), var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
          }}
          title={passkey.transports[0]}
        >
          <OutlinedIcon
            icon={PasskeyIcons[passkey.transports[0]]}
            className="text-snowflake-gray-1 text-2xl"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold leading-5">
            {passkey.name || "Untitled"}
          </h3>
          <h4 className="leading-4 text-snowflake-gray-1 text-sm">
            Added on{" "}
            <HumanDate
              date={passkey.createdAt}
              options={{
                year: "numeric",
                month: "long",
                day: "numeric",
              }}
            />
          </h4>
          <h4 className="leading-4 text-snowflake-gray-1 text-sm">
            Last used{" "}
            <HumanDate
              date={passkey.lastUsed}
              options={{
                year: "numeric",
                month: "long",
                day: "numeric",
              }}
            />
          </h4>
        </div>
      </section>
      <section className="flex flex-row gap-4">
        <Button
          shape="squareSmall"
          color="secondary"
          variant="flat"
          onClick={() => {
            setRenamingCurrentName && setRenamingCurrentName(passkey.name);
            setRenamingID && setRenamingID(passkey.id);
          }}
        >
          <OutlinedIcon icon="edit" className="mb-[0.125rem]" />
        </Button>
        <Button
          shape="squareSmall"
          color="danger"
          variant="flat"
          onClick={() => setShowRemovalConfirmation(true)}
        >
          <OutlinedIcon icon="delete" className="mb-[0.125rem]" />
        </Button>
      </section>
    </section>
  );
}
