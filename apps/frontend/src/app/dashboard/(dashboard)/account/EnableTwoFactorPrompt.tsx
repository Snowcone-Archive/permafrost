import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import Prompt from "@/components/Prompt";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { Begin2FAResponse } from "@snowflake-software/permafrost-js";
import QrSvg from "@wojtekmaj/react-qr-svg";
import { useEffect, useState } from "react";

export default function EnableTwoFactorPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [step, setStep] = useState<number>(-1);
  const [enteredCode, setEnteredCode] = useState("");
  const [setupData, setSetupData] = useState<Begin2FAResponse | undefined>(
    undefined
  );

  const [backupCodes, setBackupCodes] = useState<string[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setSetupData(undefined);
        setBackupCodes(undefined);
        setEnteredCode("");
      }, 300);
      return;
    }

    permafrost.users.twoFactorAuth.begin().then((setupData) => {
      setSetupData(setupData);
      setStep(0);
    });
  }, [visible, permafrost.users.twoFactorAuth]);

  const completeSetup = () => {
    setStep(-1);
    notifications.create({
      type: "info",
      text: "Verifying...",
    });

    permafrost.users.twoFactorAuth
      .complete({ otp: enteredCode })
      .then((result) => {
        if (result.success) {
          notifications.create({
            type: "success",
            text: "Two-factor authentication enabled.",
          });
          setBackupCodes(result.backupCodes);
          setStep(2);
        } else {
          notifications.create({
            type: "error",
            text: "Invalid code.",
          });
          setStep(1);
        }
      })
      .catch((err) => {
        notifications.fromError(err);
        setStep(1);
      });
  };

  const downloadBackupCodes = () => {
    if (!backupCodes) return;

    const file = new File(
      [
        "These are your Permafrost backup codes. Keep these in a safe place and do not share them with anybody!",
        "\n\n",
        ...backupCodes.map((code) => `• ${code}\n`),
      ],
      "permafrost_backup_codes.txt",
      {
        type: "text/plain",
      }
    );

    const link = document.createElement("a");
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Prompt
      className="sm:!max-w-xl w-full"
      visible={visible}
      buttons={
        step === 0 ? (
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
              color="primary"
              variant="flat"
              onClick={() => {
                setStep(1);
              }}
            >
              Next
            </Button>
          </>
        ) : step === 1 ? (
          <>
            <Button
              shape="slim"
              color="secondary"
              variant="flat"
              onClick={() => {
                setStep(0);
              }}
            >
              Back
            </Button>
            <Button
              shape="slim"
              color="success"
              variant="flat"
              onClick={() => {
                completeSetup();
              }}
            >
              Enable 2FA
            </Button>
          </>
        ) : step === 2 && backupCodes ? (
          <>
            <Button
              shape="slim"
              color="secondary"
              variant="flat"
              onClick={downloadBackupCodes}
            >
              Save to file
            </Button>
            <Button
              shape="slim"
              color="primary"
              variant="flat"
              onClick={() => {
                setVisible(false);
              }}
            >
              Done
            </Button>
          </>
        ) : (
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
          </>
        )
      }
    >
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl">Enable Two-Factor Authentication</h2>
        {step === -1 ? (
          <div className="pt-5">
            <Loader center />
          </div>
        ) : step === 0 && setupData ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row items-center">
              <div className="flex flex-col gap-2 mr-2">
                <h3 className="font-bold uppercase text-snowflake-gray-1">
                  Step 1
                </h3>
                <p className="text-md leading-5">
                  Scan the QR code to the right in a two-factor authentication
                  vault, such as Authy or Google Authenticator.
                </p>
                <p className="text-md leading-5">
                  Alternatively, if you can&apos;t access the QR code, enter the
                  code below into your authenticator application.
                </p>
              </div>
              <div className="bg-white p-4 flex-grow rounded-xl">
                <QrSvg value={setupData!.totpUrl} className="w-32" />
              </div>
            </div>
            <div className="pt-2">
              <Input value={setupData!.secret} readOnly />
            </div>
          </div>
        ) : step === 1 ? (
          <div>
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="font-bold uppercase text-snowflake-gray-1">
                Step 2
              </h3>
              <p className="text-md leading-5">
                Enter the code generated in your two-factor authentication app
                below. This code will refresh every 30 seconds.
              </p>

              <Input
                placeholder="Two-Factor Code"
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value);
                }}
              />
            </div>
          </div>
        ) : step === 2 && backupCodes ? (
          <>
            <div>
              <div className="flex flex-col gap-2 pt-2">
                <h3 className="font-bold uppercase text-snowflake-gray-1">
                  Step 3
                </h3>
                <p className="text-md leading-5">
                  You have 6 backup codes that can be used if you lose access to
                  your two-factor authentication appl.
                </p>

                <div className="grid grid-cols-2 mt-2 bg-[#2d2f43] rounded-xl p-2">
                  {backupCodes.map((code) => (
                    <div
                      key={code}
                      className="text-md font-mono text-[#b5b6bd] text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <p className="text-md leading-5">
                  Keep these somewhere safe! You never know when you may need
                  them.
                </p>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </Prompt>
  );
}
