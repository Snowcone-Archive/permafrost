"use client";

import DatapointArea from "@/components/DatapointArea";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { browserStorage } from "@/utils/storage";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { unescape } from "querystring";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const permafrost = usePermafrost();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [otp, setOTP] = useState<string | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const { continue: continueURL } = useQuery();

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
      .password({ email, password, otp })
      .then((result) => {
        router.replace(
          continueURL ? unescape(continueURL)!.toString() : "/dashboard"
        );
        browserStorage()?.set("auth", result);
      })
      .catch((result) => {
        if (result.error) {
          const error = result.error;

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

  useEffect(() => {
    const storage = browserStorage(true);
    const twoFactor = storage?.get("2fa");

    if (
      twoFactor === undefined ||
      twoFactor.email === undefined ||
      twoFactor.password === undefined
    ) {
      storage?.remove("2fa");
      router.push("/auth");
      return;
    }

    setEmail(twoFactor.email);
    setPassword(twoFactor.password);
    setLoading(false);
  }, [router]);

  return loading ? (
    <div>
      <Loader center />
      <div></div>
    </div>
  ) : (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <div>
          <h2 className="font-bold text-2xl">Two-Factor Authentication</h2>
          <div>
            This account has enabled additional security measures. A temporary
            code is necessary to login.
          </div>
        </div>
        <DatapointArea
          title="2FA Code"
          icon={<OutlinedIcon icon="lock" />}
          className="mb-1"
        >
          <Input
            type="text"
            value={otp}
            onEnter={login}
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          />
        </DatapointArea>
      </div>
      <footer className="flex flex-col gap-2 items-start">
        <div className="text-snowflake-fg-danger">{errorText}</div>
        <div className="flex flex-row gap-2 w-full">
          <Button
            onClick={() => router.push("/auth")}
            shape="square"
            color="secondary"
          >
            <OutlinedIcon icon="arrow_back" />
          </Button>
          <Button disabled={loggingIn} onClick={login} className="flex-grow">
            <div className="relative">
              <span className={loggingIn ? "opacity-0" : "opacity-100"}>
                Continue
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
      </footer>
    </>
  );
}
