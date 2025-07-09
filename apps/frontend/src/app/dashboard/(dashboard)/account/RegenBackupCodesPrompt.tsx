import Prompt from "@/components/Prompt";
import Button from "@/components/inputs/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import { browserStorage } from "@/utils/storage";
import { useEffect, useState } from "react";

export function RegenBackupCodesPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const sudo = useSudo();

  const [backupCodes, setBackupCodes] = useState<string[] | undefined>(
    undefined
  );

  useEffect(() => {
    setTimeout(() => {
      const codes = browserStorage(true)?.get("backupCodes");
      const shouldShow = browserStorage(true)?.get("shouldShowBackupCodes");

      if (codes) {
        setBackupCodes(codes);
      }

      if (shouldShow) {
        setVisible(true);
        browserStorage(true)?.remove("shouldShowBackupCodes");
      }
    }, 500);
  }, [setVisible]);

  function resetBackupCodes() {
    sudo
      .requireSudo(() => permafrost.users.twoFactorAuth.resetBackupCodes())
      .then((v) => {
        setBackupCodes(v.codes);
        browserStorage(true)?.set("shouldShowBackupCodes", true);
        browserStorage(true)?.set("backupCodes", v.codes);
      })
      .catch((err) => {
        notifications.fromError(err);
      });
  }

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
            {!backupCodes ? "Cancel" : "Close"}
          </Button>

          {!backupCodes && (
            <Button
              shape="slim"
              color="danger"
              variant="flat"
              onClick={resetBackupCodes}
            >
              Regenerate
            </Button>
          )}
        </>
      }
    >
      {!backupCodes ? (
        <div className="flex flex-col">
          <h2 className="font-bold text-2xl">Confirmation</h2>
          <p>Are you sure you want to regenerate your backup codes?</p>
          <p>You will not be able to use your old ones.</p>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-md leading-5">
              You have 6 backup codes that can be used if you lose access to
              your two-factor authentication application.
            </p>

            <div className="grid grid-cols-2 mt-2 bg-[#2d2f43] rounded-xl p-2">
              {backupCodes &&
                backupCodes.map((code) => (
                  <div
                    key={code}
                    className="text-md font-mono text-[#b5b6bd] text-center"
                  >
                    {code}
                  </div>
                ))}
            </div>

            <p className="text-md leading-5">
              Keep these somewhere safe! You never know when you may need them.
            </p>
          </div>
        </div>
      )}
    </Prompt>
  );
}
