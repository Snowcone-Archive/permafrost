"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/inputs/Input";
import Button from "@/components/inputs/Button";
import useQuery from "@/utils/useQuery";
import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Loader from "@/components/Loader";
import { usePermafrost } from "@/contexts/PermafrostContext";

export default function Reset() {
  const router = useRouter();
  const permafrost = usePermafrost();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const { email: queryEmail } = useQuery();

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  const sendRequest = async () => {
    setErrorText(undefined);

    if (email === "") {
      setErrorText("E-Mail cannot be empty.");
      return;
    }

    setLoading(true);
    permafrost.auth.passwordReset
      .request({ email })
      .then((result) => {
        router.replace("/auth/forgot/sent");
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
        setLoading(false);
      });
  };

  return (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <div>
          <h2 className="font-bold text-2xl">Forgot Password?</h2>
          <div>
            Please enter your e-mail below. If an account exists with this
            email, a message will be sent containing a link to reset your
            password.
          </div>
        </div>
        <DatapointArea
          title="E-Mail"
          icon={<OutlinedIcon icon="email" />}
          className="mb-1"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onEnter={sendRequest}
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
          <Button
            disabled={loading}
            onClick={sendRequest}
            className="flex-grow"
          >
            <div className="relative">
              <span className={loading ? "opacity-0" : "opacity-100"}>
                Submit
              </span>
              <div
                className={`${
                  loading ? "opacity-100" : "opacity-0"
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
