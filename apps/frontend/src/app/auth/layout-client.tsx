"use client";

import LoginMain from "@/components/LoginMain";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const permafrost = usePermafrost();
  const pathname = usePathname();

  useEffect(() => {
    if (
      permafrost.auth.user != undefined &&
      permafrost.auth.session != undefined &&
      pathname !== "/auth/verify-email"
    ) {
      router.replace("/dashboard");
    }
  }, [permafrost.auth, router, pathname]);

  return <LoginMain>{children}</LoginMain>;
}
