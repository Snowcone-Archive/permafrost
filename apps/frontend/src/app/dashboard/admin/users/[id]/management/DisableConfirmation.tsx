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
import { useParams } from "next/navigation";

export default function DisableAccountPrompt({
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setTimeout(() => {
      setMessage("");
    }, 250);
  };

  const disableAccount = () => {
    if (typeof id !== "string") return;
    setVisible(false);
    console.log(message);

    sudo
      .requireSudo(() => permafrost.users.disable(id, { message: message }))
      .then(() => {
        notifications.create({
          type: "success",
          text: "Account disabled successfully.",
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
            disabled={loading}
            onClick={disableAccount}
          >
            {loading ? <Loader color="#ff4f4f" /> : "Disable"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl">Disable account?</h2>
        <p className="leading-5 text-[#C8CBEA]">
          Are you sure you want to disable this account?
        </p>
        <DatapointArea title="Reason" icon={<OutlinedIcon icon="message" />}>
          <Input
            placeholder="Reason for disabling this account (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DatapointArea>
      </div>
    </Prompt>
  );
}
