"use client";

import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type {
  AuthorizationScopes,
  GetApplicationResponse,
} from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BackgroundLayoutLoader from "../sudo/SudoLoader";

function ScopeStatus(props: { value: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {props.value ? (
        <OutlinedIcon
          icon="check"
          className={"text-snowflake-fg-success w-5 h-5"}
        />
      ) : (
        <OutlinedIcon
          icon="close"
          className={"text-snowflake-fg-danger w-5 h-5"}
        />
      )}{" "}
    </div>
  );
}

export default function Authorize({
  application,
  scope,
  redirectURI,
  state,
}: {
  application: GetApplicationResponse;
  scope: AuthorizationScopes[];
  redirectURI: string;
  state: string;
}) {
  const permafrost = usePermafrost();
  const router = useRouter();

  const [authorizingError, setAuthorizingError] = useState<string | undefined>(
    undefined
  );
  const [authorizing, setAuthorizing] = useState(false);

  const authorize = useCallback(async () => {
    setAuthorizing(true);

    return permafrost.authorizations
      .authorize({
        application: application!.id,
        scopes: scope,
      })
      .then((res) => {
        if (res === undefined) return;
        router.push(`${redirectURI}?code=${res.requestCode}&state=${state}`);
      })
      .catch((err) => {
        console.error(err);
        setAuthorizingError(err.error.message || err.error.code);
        setAuthorizing(false);
      });
  }, [
    application,
    permafrost.authorizations,
    redirectURI,
    router,
    scope,
    state,
  ]);

  useEffect(() => {
    if (application.isAuthorized) {
      authorize();
    }
  }, [application, authorize]);

  return authorizing && application.isAuthorized ? (
    <BackgroundLayoutLoader />
  ) : (
    <>
      <div
        className={`bg-[#1a1d31] p-6 sm:p-12 rounded-xl flex flex-col gap-4 sm:w-[30rem] w-[calc(100vw-2rem)]`}
      >
        <div className="flex flex-row justify-center items-center gap-4">
          <div>
            <ApplicationIcon
              size="xl"
              id={application.id}
              className="flex-shrink-0"
            />
          </div>
          <OutlinedIcon icon="add" className="w-8 h-8" />
          <div>
            <ProfilePicture
              size="xl"
              id={permafrost.auth.user!.id}
              className="flex-shrink-0"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-xl">Authorize app</h3>
          <h2 className="text-4xl font-bold text-center">
            {application?.name}
          </h2>
          <h3 className="text-xl">to access your account</h3>
        </div>
        <div className="sm:grid sm:grid-cols-2 sm:gap-y-1 sm:gap-x-4 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <ScopeStatus value={scope.includes("profile")} />
            Read public data
          </div>
          <div className="flex items-center gap-2">
            <ScopeStatus value={scope.includes("email")} />
            Read private data
          </div>
        </div>
        <div>
          <div className="flex flex-row text-xs justify-center items-center text-snowflake-fg-dim">
            <span>Created by</span>
            <ProfilePicture
              id={application.owner.id}
              size="2xs"
              className="ml-2 mr-1 flex-shrink-0"
              cacheBuster="1234"
            />
            <span>{application.owner.displayName}</span>
          </div>
          <div className="flex flex-row text-xs justify-center items-center text-snowflake-fg-dim">
            This application has{" "}
            {application.users === 0
              ? "no users"
              : application.users === 1
              ? "1 user"
              : `${application.users} users`}{" "}
          </div>
          <div className="flex flex-row text-xs justify-center items-center text-snowflake-fg-dim text-center">
            Once authorized, you will be redirected to{" "}
            {new URL(redirectURI || "").host}
          </div>
        </div>
        {authorizingError ? (
          <div>
            <div className="mt-1 text-snowflake-fg-danger text-center">
              {authorizingError}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-row gap-4 w-full">
        <Button
          shape="square"
          color="secondary"
          onClick={() => {
            window.history.go(-1);
          }}
        >
          <OutlinedIcon icon="arrow_back" className="w-6 h-6" />
        </Button>
        <Button
          color="success"
          className="flex-grow"
          disabled={authorizing}
          onClick={authorize}
        >
          {authorizing ? <Loader color="#20fea1"></Loader> : "Authorize"}
        </Button>
      </div>
    </>
  );
}
