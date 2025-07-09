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
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Checkbox from "@/components/inputs/Checkbox";

export default function DeleteAccountPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();
  const { id } = useParams();
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR(
    "user-" + id,
    async () => permafrost.users.getAsAdmin(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  const [message, setMessage] = useState("");
  const [usernameConfirm, setUsernameConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setTimeout(() => {
      setMessage("");
    }, 250);
  };

  const disableAccount = () => {
    if (typeof id !== "string") return;
    setVisible(false);

    sudo
      .requireSudo(() => permafrost.users.delete(id, { message: message }))
      .then(() => {
        router.push("/dashboard/admin/users");
        notifications.create({
          type: "success",
          text: "Account deleted successfully.",
        });
      })
      .catch((err) => notifications.fromError(err));
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
            disabled={loading || usernameConfirm !== data?.username}
            onClick={disableAccount}
          >
            {loading ? <Loader color="#ff4f4f" /> : "Delete"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl">Delete account?</h2>
        <p className="leading-5">
          Are you sure you want to <b>PERMANENTLY DELETE</b> this account?
        </p>
        <DatapointArea title="Reason" icon={<OutlinedIcon icon="message" />}>
          <Input
            placeholder="Reason for deleting this account (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DatapointArea>
        <p className="leading-5">
          <b>Warning:</b> This action is irreversible and will permanently
          delete this account. This action cannot be undone.
        </p>
        <p className="leading-5">
          To confirm, type{" "}
          <b className="pointer-events-none">{data?.username}</b> in the field
          below.
        </p>
        <Input
          placeholder="Confirm Username"
          value={usernameConfirm}
          onChange={(e) => setUsernameConfirm(e.target.value)}
        />
      </div>
    </Prompt>
  );
}
