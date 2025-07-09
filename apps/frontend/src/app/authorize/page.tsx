"use client";

import { usePermafrost } from "@/contexts/PermafrostContext";
import useQuery from "@/utils/useQuery";
import type {
  AuthorizationScopes,
  DefaultError,
} from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import BackgroundLayoutLoader from "../sudo/SudoLoader";
import Authorize from "./Authorize";
import Error from "./Error";

const validScopes = ["profile", "email"];

export default function Home() {
  const router = useRouter();
  const permafrost = usePermafrost();

  const {
    client_id: clientID,
    redirect_uri: redirectURI,
    scope,
    state,
    ready,
  } = useQuery();

  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<DefaultError | undefined>(undefined);
  const [scopes, setScopes] = useState<AuthorizationScopes[]>([]);

  const { data, isLoading } = useSWR(
    permafrost.auth.session === undefined || !verified
      ? null
      : ["/applications", permafrost.auth.session],
    () => permafrost.applications.get(clientID!),
    {
      onError: (err) => {
        setError(err);
      },
      onSuccess: (data) => {},
    }
  );
  //
  useEffect(() => {
    if (!ready) return;

    // This check used to have an additional `|| !state` check that almost never was matched as true.
    // After analyzing the code for a bit, I couldn't find any vital usage of that property.
    // I removed this check as it was preventing authorizing apps through regular usage of the frontend.
    // Feel free to readd it, if you manage to fix this issue.
    console.log(clientID, redirectURI, scope);
    if (!clientID || !redirectURI || !scope) {
      setError({
        error: {
          code: "MissingComponents",
          message: "The provided authorization link was missing components.",
        },
      });
      return;
    }

    // Check scopes
    const scopes: string[] = [];

    scope
      .replaceAll("+", ",")
      .replaceAll(" ", ",")
      .split(",")
      .forEach((scop) => {
        if (scopes.includes(scop)) return;
        scopes.push(scop);
      });

    const valid = scopes.some((scop) => {
      return validScopes.includes(scop);
    });

    if (!valid) {
      setError({
        error: {
          code: "InvalidScope",
          message: "The provided scope was invalid.",
        },
      });
      return;
    }

    // Set everything
    setScopes(scopes as AuthorizationScopes[]);
    setVerified(true);
    setError(undefined);
  }, [clientID, redirectURI, scope, state, ready]);

  return isLoading ? (
    <BackgroundLayoutLoader />
  ) : error ? (
    <Error error={error} />
  ) : data ? (
    <Authorize
      application={data!}
      scope={scopes}
      redirectURI={redirectURI!}
      state={state!}
    />
  ) : (
    <BackgroundLayoutLoader />
  );
}
