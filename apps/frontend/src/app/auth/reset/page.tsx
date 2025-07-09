"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/inputs/Input";
import Button from "@/components/inputs/Button";
import Loader from "@/components/Loader";
import Link from "next/link";
import useQuery from "@/utils/useQuery";
import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useNotifications } from "@/contexts/NotificationContext";

export default function Reset() {
  const router = useRouter();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loggingIn, setLoggingIn] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();

  const { token, userId } = useQuery();

  const reset = async () => {
    setErrorText(undefined);

    if (token === undefined || userId === undefined) {
      setErrorText("Invalid reset token.");
      return;
    }

    if (password === "") {
      setErrorText("Password cannot be empty.");
      return;
    }

    if (passwordConfirm === "") {
      setErrorText("Password cannot be empty.");
      return;
    }

    if (passwordConfirm !== password) {
      setErrorText("Password must match.");
      return;
    }

    setLoggingIn(true);
    permafrost.auth.passwordReset
      .submit({ password, userId, token })
      .then((result) => {
        notifications.create({
          text: "Your password has been reset. You may now log in.",
          type: "success",
        });
        router.replace("/auth");
      })
      .catch((result) => {
        if (result.error) {
          // message
          setErrorText(
            result.error.message ||
            result.error.code ||
            "Unknown error, see console"
          );
        } else {
          setErrorText("Unknown error, see console");
        }
        setLoggingIn(false);
      });
  };

  useEffect(() => {
    if (token === undefined || userId === undefined) {
      if (token === undefined && userId === undefined) {
        setErrorText("Invalid reset token and user ID.");
      } else if (token === undefined) {
        setErrorText("Invalid reset token.");
      } else if (userId === undefined) {
        setErrorText("Invalid user ID.");
      }
      setValid(false);
      setLoading(false);
      return;
    }

    setErrorText(undefined);
    setValid(true);
    setLoading(false);
  }, [token, userId]);

  return (
    <>
      {!loading ? (
        valid ? (
          <>
            <div className="flex-grow flex flex-col gap-8">
              <div>
                <h2 className="font-bold text-2xl">Reset Password</h2>
              </div>
              <DatapointArea
                title="Password"
                className="mb-1"
                icon={<OutlinedIcon icon="password" />}
              >
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </DatapointArea>

              <DatapointArea
                title="Confirm Password"
                className="mb-1"
                icon={<OutlinedIcon icon="password" />}
              >
                <Input
                  type="password"
                  value={passwordConfirm}
                  onEnter={reset}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                  }}
                />
              </DatapointArea>
            </div>
            <footer className="flex flex-col gap-2 items-start">
              <div className="text-snowflake-fg-danger">{errorText}</div>
              <div className="flex flex-row gap-2 w-full">
                <Button
                  disabled={loggingIn}
                  onClick={reset}
                  className="flex-grow"
                >
                  <div className="relative">
                    <span className={loggingIn ? "opacity-0" : "opacity-100"}>
                      Reset Password
                    </span>
                    <div
                      className={`${loggingIn ? "opacity-100" : "opacity-0"
                        } absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}
                    >
                      <Loader color="#207efe" />
                    </div>
                  </div>
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <>
            <div className="flex flex-grow flex-col gap-2">
              <div className="text-snowflake-fg-danger">{errorText}</div>
              <Link
                className="text-snowflake-fg-info hover:underline"
                href="/auth"
              >
                Return to login
              </Link>
            </div>
            <div></div>
          </>
        )
      ) : (
        <></>
      )}
    </>
  );
}
