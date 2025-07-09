"use client";

import SidebarLayout from "@/app/dashboard/SidebarLayout";
import "@/app/globals.css";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { idParam } = useParams();
  const id = idParam!;
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  const { data: applications } = useSWR(
    "all-applications",
    async () => permafrost.applications.listAll(),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  return (
    <SidebarLayout
      dropdown={{
        type: "application",
        loading: isLoading,
        selected: {
          name: data?.name || "Loading...",
          id: Array.isArray(id) ? id[0] : id,
        },
        selections:
          applications?.applications.map((application) => ({
            name: application.name,
            id: application.id,
            link: `/dashboard/admin/applications/${application.id}`,
            href: `/dashboard/admin/applications/${application.id}/profile`,
          })) || [],
      }}
      navigationSections={[
        {
          title: "Options",
          items: [
            {
              title: "Profile",
              icon: "feed",
              href: `/dashboard/admin/applications/${id}/profile`,
            },
            {
              title: "Users",
              icon: "people",
              href: `/dashboard/admin/applications/${id}/users`,
            },
            {
              title: "Management",
              icon: "build",
              href: `/dashboard/admin/applications/${id}/management`,
            },
          ],
        },
      ]}
      back="/dashboard/admin/applications"
    >
      {children}
    </SidebarLayout>
  );
}
