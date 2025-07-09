"use client";

import BackgroundLayoutLoader from "@/app/sudo/SudoLoader";
import BackgroundLayout from "@/components/BackgroundLayout";
import Loader from "@/components/Loader";
import LoginMain from "@/components/LoginMain";
import { browserStorage } from "@/utils/storage";
import { Permafrost } from "@snowflake-software/permafrost-js";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const Context = createContext(
  new Permafrost("https://pfapi.snowflake.blue")
);

export const usePermafrost = () => {
  return useContext(Context);
};

export default function PermafrostContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [loaded, setLoaded] = useState(false);
  const permafrost = useRef(
    new Permafrost(
      process.env.NODE_ENV === "production"
        ? "https://pfapi.snowflake.blue"
        : "http://localhost:1234"
    )
  );

  // Authorize permafrost.js
  useEffect(() => {
    const localStorage = browserStorage();

    if (!localStorage) return;

    const data = localStorage.get("auth");

    if (data) {
      permafrost.current.auth.user = data.user;
      permafrost.current.auth.session = data.session;
    }

    setLoaded(true);
  }, []);

  return (
    <Context.Provider value={permafrost.current}>
      {loaded ? (
        children
      ) : pathname.startsWith("/dashboard") ? (
        <div className="mt-8">
          <Loader center />
        </div>
      ) : pathname.startsWith("/authorize") || pathname.startsWith("/sudo") ? (
        <BackgroundLayout>
          <BackgroundLayoutLoader />
        </BackgroundLayout>
      ) : (
        <LoginMain>
          <Loader center />
          <div></div>
        </LoginMain>
      )}
    </Context.Provider>
  );
}
