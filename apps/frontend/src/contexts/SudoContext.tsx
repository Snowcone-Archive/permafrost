"use client";

import { createContinueUrl } from "@/utils/general";
import type { DefaultError, Error } from "@snowflake-software/permafrost-js";
import { ErrPromise } from "@snowflake-software/permafrost-js";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";

export const Context = createContext({
  requireSudo: <S, E extends DefaultError>(
    f: () => ErrPromise<S, E>
  ): ErrPromise<S, E | Error<"NotInitialized">> => {
    return new ErrPromise((resolve, reject) => {
      reject({
        error: {
          code: "NotInitialized",
          message:
            "The sudo mode provider is not initialized. This shouldn't have happened!",
        },
      });
    });
  },
  sudoEnabled: (expires: number) => {},
  expires: null as Date | null,
});

export const useSudo = () => {
  return useContext(Context);
};

export default function SudoContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sudoCompleteCallback = useRef<() => void>(null);
  const [sudoExpires, setSudoExpires] = useState<Date | null>(null);
  const pathname = usePathname();

  const requireSudo = <S, E extends DefaultError>(
    f: () => ErrPromise<S, E>
  ): ErrPromise<S, E | Error<"NotInitialized">> => {
    return new ErrPromise<S, E>((resolve, reject) => {
      f()
        .then(resolve)
        .catch((err) => {
          console.log(err);
          if (err.error.code === "SudoModeRequired") {
            sudoCompleteCallback.current = () => {
              requireSudo(f).then(resolve).catch(reject);
            };

            router.push(`/sudo?${createContinueUrl()}`);
          } else {
            reject(err);
          }
        });
    });
  };

  const sudoEnabled = (expires: number) => {
    setSudoExpires(new Date(Date.now() + expires * 1000));
    if (sudoCompleteCallback.current) {
      sudoCompleteCallback.current();
      sudoCompleteCallback.current = null;
    }
  };

  return (
    <Context.Provider
      value={{
        requireSudo,
        sudoEnabled,
        expires: sudoExpires,
      }}
    >
      {children}
    </Context.Provider>
  );
}
