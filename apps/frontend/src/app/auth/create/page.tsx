"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { browserStorage } from "@/utils/storage";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const usernameRegex = /^[a-zA-Z0-9-_]+$/;

function checkValidity(username: string) {
  return (
    username.length >= 3 &&
    username.length <= 20 &&
    usernameRegex.test(username)
  );
}

export default function OAuthCreate() {
  const router = useRouter();
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const [creating, setCreating] = useState(false);

  const [password, setPassword] = useState<string>("");

  const [usernameValid, setUsernameValid] = useState<boolean>(false);
  const [usernameTaken, setUsernameTaken] = useState<boolean>(false);
  const [usernameTakenLoading, setUsernameTakenLoading] =
    useState<boolean>(true);

  const [typingTimer, setTypingTimer] = useState<Timer>();

  const { token, username, type } = useQuery();
  const [requestedUsername, setRequestedUsername] = useState<
    string | undefined
  >(username);

  const checkUsernameTaken = useCallback(
    (username: string) => {
      if (!token) return;

      const isUsernameValid = checkValidity(username);
      setUsernameValid(isUsernameValid);
      if (!isUsernameValid) return;

      setUsernameTakenLoading(true);
      permafrost.users
        .checkUsername(username, { token })
        .then((response) => {
          setUsernameTaken(response.taken);
          setUsernameTakenLoading(false);
        })
        .catch((e) => notifications.fromError(e));
    },
    [notifications, permafrost.users, token]
  );

  const loginAfterCreation = (result: { token: string }) => {
    permafrost.auth
      .token({ token: result.token })
      .then((result) => {
        browserStorage()?.set("auth", result);
        if (result.user.flags.includes("RequiresEmailVerification")) {
          router.push("/auth/verify-email");
        } else {
          router.push("/dashboard");
        }
      })
      .catch((result) => {
        notifications.fromError(result);
        router.replace("/auth");
      });
  };

  const create = () => {
    if (!token) return;
    setCreating(true);

    if (type === "github") {
      permafrost.auth.oauth
        .createFromGithub(token, {
          username: requestedUsername!,
        })
        .then((value) => {
          if (!value) return;
          notifications.create({
            type: "success",
            text: "Account created",
          });
          loginAfterCreation(value);
        })
        .catch((e) => {
          notifications.fromError(e);
          setCreating(false);
        });
    } else if (type === "discord") {
      permafrost.auth.oauth
        .createFromDiscord(token, {
          username: requestedUsername!,
        })
        .then((value) => {
          if (!value) return;
          notifications.create({
            type: "success",
            text: "Account created",
          });
          loginAfterCreation(value);
        })
        .catch((e) => {
          notifications.fromError(e);
          setCreating(false);
        });
    } else if (type === "email") {
      permafrost.users
        .finishCreation(token, {
          username: requestedUsername!,
          password: password,
        })
        .then((value) => {
          if (!value) return;
          notifications.create({
            type: "success",
            text: "Account created",
          });
          loginAfterCreation(value);
        })
        .catch((e) => {
          notifications.fromError(e);
          setCreating(false);
        });
    }
  };

  useEffect(() => {
    setRequestedUsername(username);
  }, [username]);

  useEffect(() => {
    if (token) {
      setIsValid(true);
      if (username) checkUsernameTaken(username);
    } else {
      setIsValid(false);
    }

    setLoading(false);
  }, [token, username, checkUsernameTaken]);

  return loading ? (
    <>
      <Loader center /> <div></div>
    </>
  ) : !isValid ? (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <div>
          <h2 className="font-bold text-2xl">Invalid token</h2>
        </div>
      </div>
      <footer className="flex flex-col gap-2 items-start">
        <div className="flex flex-row gap-2 w-full">
          <Button
            onClick={() => router.push("/auth")}
            color="secondary"
            className="w-full"
          >
            <OutlinedIcon icon="arrow_back" />
          </Button>
        </div>
      </footer>
    </>
  ) : (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <div>
          <h2 className="font-bold text-2xl">Create Account</h2>
          {type !== undefined &&
            (type === "email" ? (
              <div>
                Welcome to Permafrost! Please choose a password and an e-mail
                below.
              </div>
            ) : (
              <div>
                {type === "github" ? (
                  <>
                    Your GitHub account, {username}, is a member of the
                    Snowflake GitHub organization,
                  </>
                ) : (
                  <>
                    Your Discord account, {username}, is a member of the
                    Snowflake Discord guild,
                  </>
                )}{" "}
                but you do not yet have a Permafrost account. Would you like to
                make one?
              </div>
            ))}
          <div className="mt-4">
            <DatapointArea
              icon={<OutlinedIcon icon="alternate_email" />}
              title={
                !usernameValid ? (
                  <span className="flex items-center">
                    Username -{" "}
                    <span className="flex items-center text-yellow-600 gap-1">
                      <OutlinedIcon icon="warning" /> Invalid
                    </span>
                  </span>
                ) : usernameTakenLoading ? (
                  <span className="flex items-center">
                    Username -{" "}
                    <span className="flex items-center text-gray-500 gap-1">
                      <OutlinedIcon icon="hourglass_empty" /> Checking...
                    </span>
                  </span>
                ) : usernameTaken ? (
                  <span className="flex items-center">
                    Username -{" "}
                    <span className="flex items-center text-red-500 gap-1">
                      <OutlinedIcon icon="close" /> Unavailable
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Username -{" "}
                    <span className="flex items-center text-green-500 gap-1">
                      <OutlinedIcon icon="check" /> Available
                    </span>
                  </span>
                )
              }
            >
              <Input
                className="mt-1 lowercase"
                value={requestedUsername || ""}
                onKeyDown={() => {
                  clearInterval(typingTimer);
                }}
                onKeyUp={() => {
                  clearInterval(typingTimer);
                  setTypingTimer(
                    setTimeout(() => {
                      if (!requestedUsername || !token) return;
                      checkUsernameTaken(requestedUsername);
                    }, 500)
                  );
                }}
                onChange={(e) => {
                  setRequestedUsername(e.target.value);
                }}
              />
              <div className="text-sm mt-1 text-snowflake-gray-1">
                Usernames may only consist of alphanumeric characters and
                underscores.
              </div>
            </DatapointArea>

            {type === "email" && (
              <DatapointArea
                icon={<OutlinedIcon icon="password" />}
                className="mt-4"
                title={"Password"}
              >
                <Input
                  className="mt-1"
                  value={password || ""}
                  type="password"
                  showHideButton
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <div className="text-sm mt-1 text-snowflake-gray-1">
                  We won&apos;t restrict you to any stupid requirements. We
                  trust that you will take the security of your account
                  seriously.
                </div>
              </DatapointArea>
            )}
          </div>
        </div>
      </div>
      <footer className="flex flex-col gap-2 items-start">
        <div className="flex flex-row gap-2 w-full">
          <Button
            onClick={() => router.push("/auth")}
            shape="square"
            color="secondary"
          >
            <OutlinedIcon icon="arrow_back" />
          </Button>
          <Button
            className="flex-grow"
            onClick={create}
            shape="normalNoPadding"
            disabled={
              creating ||
              !usernameValid ||
              usernameTakenLoading ||
              usernameTaken ||
              (type === "email" && password.length === 0)
            }
          >
            {creating ? <Loader color="#207efe" /> : "Create Account"}
          </Button>
        </div>
      </footer>
    </>
  );
}
