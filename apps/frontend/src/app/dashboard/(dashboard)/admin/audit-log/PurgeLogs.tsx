import DatapointArea from "@/components/DatapointArea";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Prompt from "@/components/Prompt";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import { useEffect, useState } from "react";

export default function PurgeLogs({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const [before, setBefore] = useState<Date | null>(null);

  const purgeLogs = async () => {
    sudo
      .requireSudo(() =>
        permafrost.admin.purgeAuditLog({
          before: before!.toISOString(),
        })
      )
      .then(() => {
        notifications.create({
          text: "Logs purged successfully.",
          type: "success",
        });
        setVisible(false);
      })
      .catch(() => {
        notifications.create({
          text: "Failed to purge logs.",
          type: "error",
        });
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
            color="danger"
            variant="flat"
            disabled={
              !before ||
              before.getTime() > new Date().getTime() - 60 * 60 * 24 * 7 * 1000
            }
            onClick={purgeLogs}
          >
            Purge
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl mb-2">Purge Logs</h2>
        <p>
          When you purge logs, logs on and before that date will be deleted.
          This date must be more than a week ago. Your action will be logged.
        </p>
        <DatapointArea
          title="On and before"
          icon={<OutlinedIcon icon="calendar_month" />}
          className="mb-1 mt-3"
        >
          <Input
            type="date"
            onChange={(e) => {
              setBefore(new Date(e.target.value));
            }}
          />
        </DatapointArea>
      </div>
    </Prompt>
  );
}
