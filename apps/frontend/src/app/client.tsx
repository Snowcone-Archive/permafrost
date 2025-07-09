"use client";

import { usePermafrost } from "@/contexts/PermafrostContext";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import { useEffect } from "react";

export default function RootClient() {
  const permafrost = usePermafrost();
  const { continue: continueURL } = useQuery();
  const router = useRouter();

  useEffect(() => {
    if (permafrost.auth.session) {
      router.push(continueURL || "/dashboard");
    } else {
      router.push(
        `/auth${continueURL ? `?continue=${escape(continueURL)}` : ""}`
      );
    }
  }, [router, permafrost.auth, continueURL]);

  return <></>;
}
