"use client";

import DatapointArea from "@/components/DatapointArea";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useMetadata } from "@/contexts/MetadataContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { createContinueUrl } from "@/utils/general";
import { browserStorage } from "@/utils/storage";
import useQuery from "@/utils/useQuery";
import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginOption from "./LoginOption";

export default function AuthClient() {
  const router = useRouter();
  const permafrost = usePermafrost();
  const { continue: continueURL } = useQuery();
  const metadata = useMetadata();
  const notifications = useNotifications();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErrorText(undefined);
    if (email === "") {
      setErrorText("E-Mail cannot be empty.");
      return;
    }

    if (password === "") {
      setErrorText("Password cannot be empty.");
      return;
    }

    setLoggingIn(true);

    permafrost.auth
      .password({
        email,
        password,
      })
      .then((result) => {
        router.replace(continueURL ? continueURL : "/dashboard");
        browserStorage()?.set("auth", result);
      })
      .catch((result) => {
        if (result.error) {
          const error = result.error;

          // needs OTP
          if (error.code === "PreconditionRequired" && error.field === "otp") {
            setLoggingIn(false);
            browserStorage(true)?.set("2fa", { email, password });
            router.push(
              `/auth/2fa${continueURL ? createContinueUrl(continueURL) : ""}`
            );
            return;
          }

          // message
          setErrorText(
            error.message || error.code || "Unknown error, see console"
          );
        } else {
          setErrorText("Unknown error, see console");
        }
        setLoggingIn(false);
      });
  };

  return (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <DatapointArea
          title="E-Mail"
          icon={<OutlinedIcon icon="email" />}
          className="mb-1"
        >
          <Input
            type="email"
            value={email}
            disabled={loading || loggingIn}
            onChange={(e) => {
              setEmail(e.target.value.trim());
            }}
          />
        </DatapointArea>

        <DatapointArea
          title="Password"
          icon={<OutlinedIcon icon="key" />}
          className="mb-1"
        >
          <Input
            showHideButton
            onEnter={login}
            type="password"
            disabled={loading || loggingIn}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div>
            <Link
              href={`/auth/forgot?email=${email}`}
              prefetch={false}
              className="text-snowflake-gray-1 hover:underline inline"
            >
              Forgot password?
            </Link>
          </div>
        </DatapointArea>
      </div>
      <footer className="flex flex-col gap-2 items-start w-full">
        <div className="text-snowflake-fg-danger">{errorText}</div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-4 w-full">
            <Button
              disabled={loggingIn || loading}
              onClick={login}
              className="flex-grow"
              shape="normalNoPadding"
            >
              <div className="relative">
                <span className={loggingIn ? "opacity-0" : "opacity-100"}>
                  Log In
                </span>
                <div
                  className={`${
                    loggingIn ? "opacity-100" : "opacity-0"
                  } absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}
                >
                  <Loader color="#207efe" />
                </div>
              </div>
            </Button>
          </div>
          <div className="flex flex-row gap-2 ">
            {metadata?.metadata?.loginOptions.map((v) => {
              return (
                <LoginOption
                  key={v.type}
                  locked={loading}
                  setLocked={setLoading}
                  backgroundColor={v.color}
                  icon={v.type}
                  totalLoginOptions={
                    metadata?.metadata?.loginOptions.length! +
                    (browserSupportsWebAuthn() ? 1 : 0)
                  }
                  onClick={() => {
                    permafrost.auth.oauth
                      .createOAuthState()
                      .then((state) => {
                        router.replace(
                          v.redirectURL.replaceAll("{{state}}", state.state)
                        );
                      })
                      .catch((e) => {
                        notifications.fromError(e);
                        setLoading(false);
                      });
                  }}
                />
              );
            })}
            {browserSupportsWebAuthn() && (
              <LoginOption
                locked={loading}
                setLocked={setLoading}
                backgroundColor="#2f314b"
                icon="passkey"
                totalLoginOptions={
                  (metadata?.metadata?.loginOptions.length || 0) + 1
                }
                onClick={() => {
                  permafrost.auth.passkeys.startLogin().then(async (result) => {
                    if (!result.sessionID) {
                      notifications.fromError({
                        error: {
                          code: "Error",
                          message: "Error occurred",
                        },
                      });
                    } else {
                      const { options } = result;
                      let resp;

                      try {
                        resp = await startAuthentication({
                          optionsJSON: options,
                        });
                      } catch (e) {
                        console.log(e);
                        notifications.create({
                          type: "error",
                          text: "An error occurred",
                        });
                        setLoading(false);
                        return;
                      }

                      if (resp) {
                        permafrost.auth.passkeys
                          .completeLogin({
                            ...resp,
                            sessionID: result.sessionID,
                          })
                          .then((result) => {
                            router.replace(
                              continueURL ? continueURL : "/dashboard"
                            );
                            browserStorage()?.set("auth", result);
                          })
                          .catch((e) => {
                            notifications.fromError(e);
                            setLoading(false);
                          });
                      }
                    }
                  });
                }}
              />
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
