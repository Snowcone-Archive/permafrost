"use client";

import DatapointArea from "@/components/DatapointArea";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useSudo } from "@/contexts/SudoContext";
import { browserStorage } from "@/utils/storage";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const urlRegex = new RegExp(
  "(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})"
);

export default function ApplicationProfile() {
  const { id } = useParams<{ id: string }>();
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const { requireSudo } = useSudo();

  const [addingRedirectURI, setAddingRedirectURI] = useState("");

  const [secret, setSecret] = useState<string | undefined>();

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
        console.log("Will retry");
      },
    }
  );

  useEffect(() => {
    const potentialSecret = browserStorage(true)?.get(
      `app-${id}-client-secret`
    );

    if (potentialSecret != undefined && potentialSecret != undefined) {
      setSecret(potentialSecret as any as string);
    }
  }, [id]);

  const isURIValid = (uri: string) => {
    if (uri === "") return false;
    if (!urlRegex.test(uri)) {
      return false;
    }

    if (data!.redirectURIs.includes(uri)) {
      return false;
    }
    return true;
  };

  const deleteRedirectURI = (uri: string) => {
    permafrost.applications.redirectURIs
      .update(data!.id, { remove: [uri] })
      .then((resp) => {
        mutate();
        notifications.create({
          type: "success",
          text: "Redirect URI removed",
        });
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  const addRedirectUri = (uri: string) => {
    if (uri === "") return true;
    if (!urlRegex.test(uri)) {
      notifications.create({
        type: "error",
        text: "Invalid URL",
      });
      return false;
    }

    if (data!.redirectURIs.includes(uri)) {
      notifications.create({
        type: "error",
        text: "Redirect URI already exists",
      });
      return false;
    }

    permafrost.applications.redirectURIs
      .update(data!.id, { add: [uri] })
      .then((resp) => {
        mutate();
        notifications.create({
          type: "success",
          text: "Redirect URI added",
        });
      })
      .catch((e) => {
        notifications.fromError(e);
      });

    return true;
  };

  const resetSecret = () => {
    requireSudo(() => permafrost.applications.resetSecret(data!.id))
      .then((resp) => {
        console.log(resp);
        if (!resp) return;
        browserStorage(true)?.set(`app-${id}-client-secret`, resp.clientSecret);
        notifications.create({
          type: "success",
          text: "Secret reset",
        });
        setSecret && setSecret(resp.clientSecret);
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  return isLoading || data === undefined ? (
    <Loader center />
  ) : (
    <main className="flex flex-col gap-4">
      <DatapointArea
        icon={<OutlinedIcon icon="badge" />}
        title="Client ID"
        className="mb-2"
      >
        <Input value={data?.id} readOnly copyable />
      </DatapointArea>

      <DatapointArea
        icon={<OutlinedIcon icon="encrypted" />}
        title="Client Secret"
        className="mb-2"
      >
        <section className="flex flex-col gap-1">
          {secret ? (
            <>
              <Input value={secret} readOnly copyable type="password" />
              <div>
                Store this secret somewhere safe. It will only be shown to you
                this once.
              </div>
            </>
          ) : (
            <>
              <Button
                shape="slim"
                color="secondary"
                variant="flat"
                onClick={resetSecret}
              >
                Regenerate client secret
              </Button>
              <div>
                For security reasons, your secret cannot be seen more than once.
                If you&apos;ve lost access to it, please generate another.
              </div>
            </>
          )}
        </section>
      </DatapointArea>

      <DatapointArea
        icon={<OutlinedIcon icon="captive_portal" />}
        title="Redirect URLs"
        className="mb-2"
      >
        <section className="flex flex-col gap-2">
          <ul className="flex flex-col gap-1">
            {data!.redirectURIs.map((uri) => (
              <li key={uri}>
                <div className="flex flex-row justify-between items-center text-lg">
                  {uri}
                  <button
                    className="flex items-center"
                    onClick={() => {
                      deleteRedirectURI(uri);
                    }}
                  >
                    {data!.redirectURIs.length > 1 && (
                      <OutlinedIcon
                        icon="delete"
                        className="!text-2xl !leading-3 text-snowflake-fg-danger hover:brightness-150"
                      />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-row items-center gap-2">
            <Input
              value={addingRedirectURI}
              placeholder="Insert new URL..."
              onChange={(e) => {
                setAddingRedirectURI(e.currentTarget.value);
              }}
              onEnter={() => {
                const result = addRedirectUri(addingRedirectURI);
                result && setAddingRedirectURI("");
              }}
              className="bg-[#383b55]"
            />
            <Button
              shape="slim"
              variant="flat"
              disabled={!isURIValid(addingRedirectURI)}
              onClick={() => {
                const result = addRedirectUri(addingRedirectURI);
                result && setAddingRedirectURI("");
              }}
            >
              Add
            </Button>
          </div>
        </section>
      </DatapointArea>
    </main>
  );
}
