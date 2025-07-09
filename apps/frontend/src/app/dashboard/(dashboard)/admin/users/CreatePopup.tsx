import DatapointArea from "@/components/DatapointArea";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Prompt from "@/components/Prompt";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useState } from "react";

export default function CreateUserPopup({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [newEmail, setNewEmail] = useState<string>("");

  const createUser = () => {
    setVisible(false);
    notifications.create({
      type: "info",
      text: "Creating user...",
    });
    permafrost.users.create({ email: newEmail })
      .then((data) => {
        notifications.create({
          type: "success",
          text: "Creation E-mail sent.",
        });
      })
      .catch((err) => {
        notifications.fromError(err);
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
            }}
          >
            Cancel
          </Button>
          <Button
            shape="slim"
            color="success"
            variant="flat"
            onClick={createUser}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl mb-2">Create User</h2>

        <DatapointArea title="E-Mail" icon={<OutlinedIcon icon="email" />} >
          <Input value={newEmail} onChange={(e) => { setNewEmail(e.target.value) }} />
        </DatapointArea>

        <p className="text-sm mt-2">
          The user will receive an email with a link to set up their account. They will have 7 days to create their account. After that period has expired, the link will no longer be valid.
        </p>
      </div>
    </Prompt>
  );
}
