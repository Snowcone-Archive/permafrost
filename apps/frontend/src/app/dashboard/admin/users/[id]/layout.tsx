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
    "user-" + id,
    async () => permafrost.users.get(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  const { data: users } = useSWR(
    "users",
    async () => permafrost.users.getAll(),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
    }
  );

  return (
    <SidebarLayout
      dropdown={{
        type: "user",
        loading: isLoading,
        selected: {
          name: `@${data?.username}` || "Loading...",
          id: Array.isArray(id) ? id[0] : id,
        },
        selections:
          users?.users.map((user) => ({
            name: `@${user.username}`,
            id: user.id,
            link: `/dashboard/admin/users/${user.id}`,
            href: `/dashboard/admin/users/${user.id}/account`,
          })) || [],
      }}
      navigationSections={[
        {
          title: "Options",
          items: [
            {
              title: "Profile",
              icon: "person",
              href: `/dashboard/admin/users/${id}/account`,
            },
            {
              title: "Connections",
              icon: "hub",
              href: `/dashboard/admin/users/${id}/connections`,
            },
            {
              title: "Applications",
              icon: "deployed_code",
              href: `/dashboard/admin/users/${id}/applications`,
            },
            {
              title: "Management",
              icon: "build",
              href: `/dashboard/admin/users/${id}/management`,
            },
          ],
        },
      ]}
      back="/dashboard/admin/users"
    >
      {children}
    </SidebarLayout>
  );
}
