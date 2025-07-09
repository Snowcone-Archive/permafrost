"use client";

import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import { browserStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import ChangeAvatarPrompt from "./ChangeAvatarPrompt";
import ChangePasswordPrompt from "./ChangePasswordPrompt";
import DisableTwoFactorPrompt from "./DisableTwoFactorPrompt";
import EnableTwoFactorPrompt from "./EnableTwoFactorPrompt";
import { RegenBackupCodesPrompt } from "./RegenBackupCodesPrompt";
import UpdateRequiredAlert from "@/components/UpdateRequiredAlert";
import { censorEmailAddress } from "@/utils/general";
import DeletionConfirmation from "@/components/DeletionConfirmation";
import { SetupPasskeyPrompt } from "./SetupPasskeyPrompt";
import useSWR from "swr";
import SWRContainer from "@/components/SWRContainer";
import PasskeyEntry from "./Passkey";
import { PasskeyContext } from "./PasskeyContext";

export default function Account() {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const sudo = useSudo();

  const {
    data: passkeys,
    isLoading: passkeysLoading,
    error: passkeysError,
    mutate: mutatePasskeys,
  } = useSWR("/passkeys", async () => {
    return permafrost.users.passkeys.get();
  });

  const [promptVisible, setPromptVisible] = useState<
    | "setProfilePicture"
    | "deleteProfilePicture"
    | "enableTwoFactor"
    | "disableTwoFactor"
    | "changePassword"
    | "regenerateBackupCodes"
    | "addPasskey"
    | undefined
  >();

  const [hasUserLoaded, setHasUserLoaded] = useState(false);

  const [displayName, setDisplayName] = useState<string | undefined>(
    permafrost.auth.user?.displayName
  );
  const [prevDisplayName, setPrevDisplayName] = useState<string | undefined>(
    permafrost.auth.user?.displayName
  );

  const [username, setUsername] = useState<string | undefined>(
    permafrost.auth.user?.username
  );
  const [prevUsername, setPrevUsername] = useState<string | undefined>(
    permafrost.auth.user?.username
  );

  const [emailShown, setEmailShown] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  const [passkeyRenamingID, setPasskeyRenamingID] = useState<
    string | undefined
  >();
  const [passkeyRenamingName, setPasskeyRenamingName] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (hasUserLoaded) return;
    if (permafrost.auth.user == undefined) return;
    const existing = browserStorage()?.get("auth");

    // Update cached data when it's available
    if (existing) {
      browserStorage()!.set("auth", {
        ...existing,
        user: permafrost.auth.user,
      });
    }
    setPrevDisplayName(permafrost.auth.user.displayName);
    setPrevUsername(permafrost.auth.user.username);
    setDisplayName(permafrost.auth.user.displayName);
    setUsername(permafrost.auth.user.username);
    setEmailContent(permafrost.auth.user.email);
    setHasUserLoaded(true);
  }, [permafrost.auth.user, hasUserLoaded]);

  const update = () => {
    if (permafrost.auth.user == undefined) return;
    if (username == undefined || emailContent == undefined) return;
    if (
      displayName == prevDisplayName &&
      username == prevUsername &&
      emailContent == permafrost.auth.user?.email
    )
      return;

    if (displayName != prevDisplayName || username != prevUsername) {
      sudo
        .requireSudo(() =>
          permafrost.users.update({
            username: username !== prevUsername ? username : undefined,
            displayName:
              displayName !== prevDisplayName ? displayName : undefined,
          })
        )
        .then((resp) => {
          if (!resp) return;
          setPrevDisplayName(displayName);
          setPrevUsername(username);

          permafrost.auth.user!.displayName = displayName || "";
          permafrost.auth.user!.username = username;

          notifications.create({
            type: "success",
            text:
              displayName !== prevDisplayName && username !== prevUsername
                ? "Updated information successfully"
                : displayName !== prevDisplayName
                ? "Updated display name successfully"
                : "Updated username successfully",
          });
        })
        .catch((e) => {
          notifications.fromError(e);
        });
    }

    if (emailContent != permafrost.auth.user?.email) {
      console.log("New Email");
      sudo
        .requireSudo(() =>
          permafrost.users.updateEmail({
            newEmail: emailContent,
          })
        )
        .then((resp) => {
          if (!resp) return;

          permafrost.auth.user!.email = emailContent;

          notifications.create({
            type: "success",
            text: "Updated email successfully. Please verify your email.",
          });
        })
        .catch((e) => {
          notifications.fromError(e);
        });
    }
  };

  const deletePicture = () => {
    setPromptVisible(undefined);
    notifications.create({
      type: "info",
      text: "Deleting profile picture...",
    });
    permafrost.users.avatar
      .delete()
      .then((data) => {
        notifications.create({
          type: "success",
          text: "Profile picture deleted.",
        });
      })
      .catch((err) => {
        notifications.fromError(err);
      });
  };

  useEffect(() => {
    if (passkeyRenamingID) {
      setPromptVisible("addPasskey");
    }
  }, [passkeyRenamingID]);

  return (
    <PasskeyContext.Provider
      value={{
        mutate: mutatePasskeys,
        setRenamingID: setPasskeyRenamingID,
        renamingID: passkeyRenamingID,
        renamingCurrentName: passkeyRenamingName,
        setRenamingCurrentName: setPasskeyRenamingName,
      }}
    >
      <main className="flex flex-col gap-4">
        <ChangeAvatarPrompt
          visible={promptVisible == "setProfilePicture"}
          setVisible={(value) =>
            setPromptVisible(value ? "setProfilePicture" : undefined)
          }
        />
        <DeletionConfirmation
          visible={promptVisible == "deleteProfilePicture"}
          setVisible={(value) =>
            setPromptVisible(value ? "deleteProfilePicture" : undefined)
          }
          onConfirm={deletePicture}
          title="Delete Profile Picture"
          message="Are you sure you want to delete your profile picture?"
        />
        <EnableTwoFactorPrompt
          visible={promptVisible == "enableTwoFactor"}
          setVisible={(value) =>
            setPromptVisible(value ? "enableTwoFactor" : undefined)
          }
        />
        <DisableTwoFactorPrompt
          visible={promptVisible == "disableTwoFactor"}
          setVisible={(value) =>
            setPromptVisible(value ? "disableTwoFactor" : undefined)
          }
        />
        <ChangePasswordPrompt
          visible={promptVisible == "changePassword"}
          setVisible={(value) =>
            setPromptVisible(value ? "changePassword" : undefined)
          }
        />
        <RegenBackupCodesPrompt
          visible={promptVisible == "regenerateBackupCodes"}
          setVisible={(value) =>
            setPromptVisible(value ? "regenerateBackupCodes" : undefined)
          }
        />
        <SetupPasskeyPrompt
          visible={promptVisible == "addPasskey"}
          setVisible={(value) =>
            setPromptVisible(value ? "addPasskey" : undefined)
          }
        />

        {permafrost.auth.user?.flags.includes("PendingEmailVerification") && (
          <UpdateRequiredAlert
            content={
              <p>
                Your new email has not yet been verified. Please check your
                email. If you need a new link, click{" "}
                <span
                  className="hover:underline brightness-125 cursor-pointer"
                  onClick={() => {
                    permafrost.users
                      .requestEmailVerification()
                      .then((response) => {
                        notifications.create({
                          type: "success",
                          text: "Verification email sent",
                        });
                      })
                      .catch((error) => {
                        notifications.fromError(error);
                      });
                  }}
                >
                  here
                </span>
                .
              </p>
            }
          />
        )}

        <DatapointArea
          icon={<OutlinedIcon icon="image" className="text-xl" />}
          title="Profile Picture"
        >
          <section className="mt-2 flex flex-col gap-4 sm:flex-row items-center">
            <ProfilePicture id={permafrost.auth.user?.id} size="2xl" />
            <section className="w-full flex flex-col items-center justify-center gap-1">
              <div className="flex flex-row w-full gap-2">
                <Button
                  color="secondary"
                  variant="flat"
                  className="grow"
                  onClick={() => {
                    setPromptVisible("setProfilePicture");
                  }}
                >
                  Change
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  shape="square"
                  className="shrink"
                  onClick={() => {
                    setPromptVisible("deleteProfilePicture");
                  }}
                >
                  <OutlinedIcon icon="delete" className="text-3xl" />
                </Button>
              </div>
              <div>Up to 5MB • 128x128 minimum • PNG, APNG, GIF or JPG</div>
            </section>
          </section>
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="sell" className="text-xl" />}
          title="Display Name"
        >
          <Input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
          />
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="person" className="text-xl" />}
          title="Username"
        >
          <Input
            value={username}
            className="lowercase"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="mail" className="text-xl" />}
          title={
            <span>
              E-Mail{" "}
              <span
                className="text-white font-medium hover:underline cursor-pointer"
                onClick={() => {
                  setEmailShown(!emailShown);
                }}
              >
                show
              </span>
            </span>
          }
        >
          <Input
            value={emailShown ? emailContent : censorEmailAddress(emailContent)}
            className="lowercase"
            disabled={!emailShown}
            onChange={(e) => {
              setEmailContent(e.target.value);
            }}
          />
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="enhanced_encryption" className="text-xl" />}
          title="Two-Factor Authentication"
        >
          {permafrost.auth.user?.twoFactorEnabled ? (
            <div className="mt-1 flex sm:flex-row flex-col w-full gap-2">
              <Button
                className="grow"
                color="secondary"
                variant="flat"
                onClick={() => {
                  setPromptVisible("regenerateBackupCodes");
                }}
              >
                {browserStorage(true)?.get("backupCodes")
                  ? "View Backup Codes"
                  : "Regenerate Backup Codes"}
              </Button>
              <Button
                color="danger"
                variant="flat"
                shape="square"
                className="sm:shrink sm:!w-14 w-full"
                onClick={() => {
                  setPromptVisible("disableTwoFactor");
                }}
              >
                <OutlinedIcon icon="power_settings_new" className="text-3xl" />
              </Button>
            </div>
          ) : (
            <Button
              className="mt-1 w-full"
              color="secondary"
              variant="flat"
              onClick={() => {
                setPromptVisible("enableTwoFactor");
              }}
            >
              Enable
            </Button>
          )}
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="key" className="text-xl" />}
          title="Password"
        >
          <div className="mt-1 gap-2">
            <Button
              className="w-full col-span-2 col-end-3"
              color="secondary"
              variant="flat"
              onClick={() => {
                setPromptVisible("changePassword");
              }}
            >
              {permafrost.auth.user?.flags.includes("RequiresPasswordChange")
                ? "Set Password"
                : "Change Password"}
            </Button>
          </div>
        </DatapointArea>

        <DatapointArea
          icon={<OutlinedIcon icon="key" className="text-xl" />}
          title="Passkeys"
        >
          <div className="mt-1">
            <SWRContainer
              data={passkeys}
              isLoading={passkeysLoading}
              error={passkeysError}
              loaderClassName="py-2"
            >
              {passkeys?.length === 0 ? (
                <div className="text-center italic text-snowflake-gray-1">
                  You do not have any passkeys registered.
                </div>
              ) : (
                <section className="flex flex-col gap-4">
                  {passkeys?.map((passkey) => (
                    <PasskeyEntry key={passkey.id} passkey={passkey} />
                  ))}
                </section>
              )}
            </SWRContainer>
            <div className="w-full flex justify-end gap-3 mt-3">
              <Button
                shape="slim"
                color="secondary"
                variant="flat"
                onClick={() => {
                  setPromptVisible("addPasskey");
                }}
              >
                Add Passkey
              </Button>
            </div>
          </div>
        </DatapointArea>

        <div className="w-full flex justify-end gap-3 mt-3">
          <Button
            shape="slim"
            color="success"
            variant="flat"
            onClick={update}
            disabled={
              !username ||
              !emailContent ||
              (displayName == prevDisplayName &&
                username == prevUsername &&
                emailContent == permafrost.auth.user?.email)
            }
          >
            Save
          </Button>
        </div>
      </main>
    </PasskeyContext.Provider>
  );
}
