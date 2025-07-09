import DatapointArea from "@/components/DatapointArea";
import { HumanDate } from "@/components/HumanDate";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Prompt from "@/components/Prompt";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { startRegistration } from "@simplewebauthn/browser";
import { useContext, useEffect, useState } from "react";
import { PasskeyIcons, type PasskeyTransports } from "./Passkey";
import { PasskeyContext } from "./PasskeyContext";

export function SetupPasskeyPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const {
    mutate,
    renamingID,
    renamingCurrentName,
    setRenamingCurrentName,
    setRenamingID,
  } = useContext(PasskeyContext);

  const [page, setPage] = useState<
    "start" | "error" | "awaiting" | "rename" | "complete"
  >("complete");

  const [transport, setTransport] = useState<PasskeyTransports | undefined>(
    undefined
  );
  const [passkeyName, setPasskeyName] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  const [registrationData, setRegistrationData] = useState<
    Awaited<ReturnType<typeof startRegistration>> | undefined
  >();

  const createPasskey = async () => {
    if (!registrationData) {
      setPage("error");
      return;
    }

    try {
      const verification = await permafrost.users.passkeys.setup({
        name: passkeyName,
        ...registrationData,
      });

      if (verification.verified) {
        setPage("complete");
        mutate();
      } else {
        setPage("error");
      }
    } catch (e: any) {
      notifications.fromError(e);
      setPage("error");
    }
  };

  const renamePasskey = async () => {
    try {
      await permafrost.users.passkeys.update(renamingID!, {
        name: passkeyName!,
      });
      setVisible(false);
      mutate();
      setRenamingCurrentName && setRenamingCurrentName("");
      setRenamingID && setRenamingID(undefined);
    } catch (e: any) {
      notifications.fromError(e);
    }
  };

  useEffect(() => {
    if (page !== "awaiting") return;

    (async () => {
      permafrost.users.passkeys.getSetupInformation().then(async (data) => {
        let resp;

        try {
          resp = await startRegistration({ optionsJSON: data as any });
        } catch (e: any) {
          setPage("error");
        }

        if (resp) {
          setRegistrationData(resp);
          resp.response.transports !== undefined &&
            setTransport(resp.response.transports[0]);
          setPage("rename");
        }
      });
    })();
  }, [page, permafrost.users.passkeys]);

  useEffect(() => {
    if (renamingID) {
      setPage("rename");
      setPasskeyName(renamingCurrentName || "");
      return;
    }

    if (visible) {
      setPage("start");
    }
  }, [visible, renamingID, renamingCurrentName]);

  return (
    <Prompt
      visible={visible}
      className="sm:!max-w-xl w-full"
      buttons={
        <>
          {page !== "complete" && (
            <Button
              shape="slim"
              color="secondary"
              variant="flat"
              onClick={() => {
                setVisible(false);
                setRenamingCurrentName && setRenamingCurrentName("");
                setRenamingID && setRenamingID(undefined);
              }}
            >
              Cancel
            </Button>
          )}
          {page === "start" ? (
            <Button
              shape="slim"
              color="primary"
              variant="flat"
              onClick={() => {
                setPage("awaiting");
              }}
            >
              Start
            </Button>
          ) : page === "error" ? (
            <Button
              shape="slim"
              color="primary"
              variant="flat"
              onClick={() => {
                setPage("start");
              }}
            >
              Retry
            </Button>
          ) : page === "rename" ? (
            <Button
              shape="slim"
              color="primary"
              variant="flat"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                renamingID === undefined
                  ? await createPasskey()
                  : await renamePasskey();
                setLoading(false);
              }}
            >
              {loading ? <Loader color="#207efe" /> : "Rename"}
            </Button>
          ) : page === "complete" ? (
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
          ) : null}
        </>
      }
    >
      <div className="flex flex-col">
        {page === "start" || page === "awaiting" || page === "error" ? (
          <main className="flex flex-col gap-4">
            <h2 className="font-bold text-2xl leading-5 mt-1">
              Add New Passkey
            </h2>
            <p>
              Passkeys serve as an alternative method for authentication, and
              helps make your account safer by using a secure password-less
              method for identifying ownership.
            </p>
            <div
              className={`p-6 border-2 rounded-xl ${
                page === "start"
                  ? "border-[#383B55] border-dashed"
                  : "border-[#383b55] bg-[#24273d]"
              } flex flex-row justify-between items-center`}
            >
              <div>
                <h3 className="font-bold text-xl leading-5">
                  {page === "start"
                    ? `Press "Start" when ready`
                    : page === "error"
                    ? "An error occurred"
                    : "Awaiting authorization"}
                </h3>
                <h4 className="text-snowflake-gray-1 leading-4">
                  {page === "start"
                    ? `Your system will prompt you to insert your key.`
                    : page === "error"
                    ? "Please try authorizing again"
                    : "Follow instructions from your browser"}
                </h4>
              </div>
              <OutlinedIcon
                icon={
                  page === "start"
                    ? "vpn_key_off"
                    : page === "error"
                    ? "vpn_key_alert"
                    : "security_key"
                }
                className="text-3xl"
              />
            </div>
          </main>
        ) : page === "complete" ? (
          <div>
            <main className="flex flex-col gap-4">
              <h2 className="font-bold text-2xl leading-5 mt-1">
                Passkey Authorized
              </h2>
              <p>
                You can now use the following passkey to authenticate into your
                Permafrost account, and authorize any two-factor authentication
                requests.
              </p>
              <div
                className="p-6 border-2 rounded-xl
                    border-[#383b55] bg-[#24273d]
                 flex flex-row justify-between items-center"
                style={{
                  boxShadow:
                    "0px 1px 2px 0px rgba(255, 255, 255, 0.25) inset, 0px 2px 5px 0px rgba(0, 0, 0, 0.25), 5px 5px 25px 0px rgba(184, 32, 254, 0.10), -5px -5px 25px 0px rgba(32, 126, 254, 0.10)",
                }}
              >
                <div>
                  <h3 className="font-bold text-xl leading-5">
                    {passkeyName == undefined ? "Untitled" : passkeyName}
                  </h3>
                  <h4 className="text-snowflake-gray-1 leading-4">
                    Added on{" "}
                    <HumanDate
                      date={new Date()}
                      options={{
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }}
                    />{" "}
                  </h4>
                </div>
                <OutlinedIcon
                  icon={transport ? PasskeyIcons[transport] : "vpn_key"}
                  className="text-3xl"
                />
              </div>
            </main>
          </div>
        ) : page === "rename" ? (
          <main className="flex flex-col gap-4">
            <h2 className="font-bold text-2xl leading-5 mt-1">
              Rename Passkey
            </h2>
            <p>
              To help differ this from any other passkeys you may add, give it a
              cool and unique name, so you know where it’s from!
            </p>
            <DatapointArea
              title="Name"
              icon={<OutlinedIcon icon="shoppingmode" />}
            >
              <Input
                className="mt-1"
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="My Super-Secure Passkey"
                value={passkeyName}
              />
            </DatapointArea>
          </main>
        ) : (
          <div>Something went horribly wrong</div>
        )}
      </div>
    </Prompt>
  );
}
