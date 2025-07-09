"use client";

import Loader from "@/components/Loader";
import { browserStorage } from "@/utils/storage";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useNotifications } from "@/contexts/NotificationContext";

export default function TokenLoading() {
  const permafrost = usePermafrost();
  const router = useRouter();
  const notifications = useNotifications();

  const { token } = useQuery();

  useEffect(() => {
    if (token && permafrost && router && notifications) {
      permafrost.auth
        .token({ token })
        .then((result) => {
          browserStorage()?.set("auth", result);
          if (result.user.flags.includes("RequiresEmailVerification")) {
            router.push("/auth/verify-email");
          } else {
            router.replace("/dashboard");
          }
        })
        .catch((result) => {
          notifications.fromError(result);
          router.replace("/auth");
        });
    }
  }, [token, permafrost, router, notifications]);

  return (
    <>
      <div className="flex items-center justify-center">
        <Loader />
      </div>
      <div></div>
    </>
  );
}
