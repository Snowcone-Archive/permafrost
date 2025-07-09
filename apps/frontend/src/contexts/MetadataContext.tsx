"use client";

import { createContinueUrl, pageRequiresAuthentication } from "@/utils/general";
import type { Metadata as PermafrostMetadata } from "@snowflake-software/permafrost-js";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";
import useSWR from "swr";
import { useNotifications } from "./NotificationContext";
import { usePermafrost } from "./PermafrostContext";

export type Metadata = {
  state: "disconnected" | "connected" | "loading";
  metadata?: PermafrostMetadata;
};

export const Context = createContext<Metadata>({
  state: "disconnected",
  metadata: undefined,
});

export const useMetadata = () => {
  return useContext(Context);
};

export default function MetadataContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const connectionNotification =
    useRef<ReturnType<typeof notifications.create>>(null);

  const [metadata, setMetadata] = useState<Metadata>({
    state: "loading",
    metadata: undefined,
  });

  const { data, error, isLoading } = useSWR(
    "metadata",
    () => permafrost.getMetadata(),
    {
      refreshInterval: 30 * 1000,
      onSuccess: (data) => {
        setMetadata({ state: "connected", metadata: data });

        console.log(pageRequiresAuthentication(pathname), data.authenticated);

        if (
          data.authenticated === false &&
          pageRequiresAuthentication(pathname)
        ) {
          if (permafrost.auth.session != undefined) {
            notifications.create({
              type: "warning",
              text: "Session expired. Please log in again.",
            });
          }
          permafrost.auth.logout();
          router.replace(`/auth/${createContinueUrl()}`);
        }

        if (connectionNotification.current) {
          connectionNotification.current.remove();
          notifications.create({
            type: "success",
            text: "Connection restored",
          });
        }
      },
      onError: (error) => {
        setMetadata({ state: "disconnected", metadata: undefined });
      },
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        setMetadata({ state: "disconnected", metadata: undefined });
        console.log("Cannot connect:", error);

        if (connectionNotification.current == undefined) {
          connectionNotification.current = notifications.create({
            type: "warning",
            text: "Connection lost! Retrying...",
            persistent: true,
          });
        } else {
          connectionNotification.current.setType("warning");
          connectionNotification.current.setText(
            `Connection lost! Retrying... (${retryCount})`
          );
        }

        if (retryCount >= 10) {
          connectionNotification.current.setType("error");
          connectionNotification.current.setText(
            "Cannot connect. Please try again later."
          );
          return;
        }
        setTimeout(() => revalidate({ retryCount }), 1000);
      },
    }
  );

  return <Context.Provider value={metadata}>{children}</Context.Provider>;
}
