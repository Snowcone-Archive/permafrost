"use client";

import Loader from "@/components/Loader";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Application() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (typeof id === "string") {
      router.push(`/dashboard/applications/${id}/profile`);
    }
  }, [id, router]);

  return (
    <div>
      <Loader center />
    </div>
  );
}
