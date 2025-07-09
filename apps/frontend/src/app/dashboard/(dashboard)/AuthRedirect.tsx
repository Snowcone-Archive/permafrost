"use client";

import { usePermafrost } from "@/contexts/PermafrostContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export default function AuthRedirect() {
  const permafrost = usePermafrost();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, error } = useSWR("users-me", async () =>
    permafrost.users.get("me")
  );

  useEffect(() => {
    if (isLoading || !data) return;

    if (data.flags.includes("RequiresEmailVerification")) {
      router.push("/auth/verify-email");
      return;
    }

    if (
      pathname.startsWith("/dashboard") &&
      error?.error?.code === "Unauthorized"
    )
      router.push("/auth");

    if (pathname.startsWith("/dashboard") && data.flags.includes("Disabled"))
      router.push("/account-disabled");

    if (
      pathname.startsWith("/dashboard/admin") &&
      !data.permissions.includes("Administrator")
    )
      router.push("/dashboard");
  }, [pathname, error, isLoading, router, data]);

  return <></>;
}
