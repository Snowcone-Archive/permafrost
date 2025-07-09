"use client";

import "@/app/globals.css";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { useParams } from "next/navigation";
import useSWR from "swr";
import SidebarLayout from "../../SidebarLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { idParam } = useParams();
  const id = idParam!;
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const { data, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(Array.isArray(id) ? id[0] : id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
        console.error(err);
      },
    }
  );

  const { data: applications } = useSWR(
    "applications",
    async () => permafrost.applications.list(),
    {
      onError(err, key, config) {
        notifications.fromError(err);
        console.error(err);
      },
    }
  );

  return (
    <>
      <SidebarLayout
        dropdown={{
          type: "application",
          loading: isLoading,
          selected: {
            name: data?.name || "Loading...",
            id: Array.isArray(id) ? id[0] : id,
          },
          selections:
            applications?.applications.map((app) => ({
              name: app.name,
              id: app.id,
              link: `/dashboard/applications/${app.id}`,
              href: `/dashboard/applications/${app.id}/profile`,
            })) || [],
        }}
        navigationSections={[
          {
            title: "Options",
            items: [
              {
                title: "Profile",
                icon: "feed",
                href: `/dashboard/applications/${id}/profile`,
              },
              {
                title: "Integration",
                icon: "hub",
                href: `/dashboard/applications/${id}/integration`,
              },
              {
                title: "Collaborators",
                icon: "group",
                href: `/dashboard/applications/${id}/collaborators`,
              },
              {
                title: "Generator",
                icon: "link",
                href: `/dashboard/applications/${id}/generator`,
              },
              {
                displayCondition: data?.owner.id === permafrost.auth.user?.id,
                title: "Management",
                icon: "build",
                href: `/dashboard/applications/${id}/management`,
              },
            ],
          },
        ]}
        back="/dashboard/applications"
      >
        {children}
      </SidebarLayout>
    </>
  );
}
