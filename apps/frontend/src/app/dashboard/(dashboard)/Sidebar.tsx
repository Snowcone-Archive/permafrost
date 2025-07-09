"use client";

import { usePermafrost } from "@/contexts/PermafrostContext";
import DashboardBaseLayout from "../SidebarLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { browserStorage } from "@/utils/storage";

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const router = useRouter();

  return (
    <DashboardBaseLayout
      navigationSections={[
        {
          title: "User",
          items: [
            {
              title: "Overview",
              icon: "dashboard",
              href: "/dashboard",
            },
            {
              title: "Account",
              icon: "person",
              href: "/dashboard/account",
            },
            {
              title: "Connections",
              icon: "hub",
              href: "/dashboard/connections",
            },
            {
              title: "Applications",
              icon: "deployed_code",
              href: "/dashboard/applications",
            },
          ],
        },
        ...(permafrost.auth.user?.permissions.includes("Administrator")
          ? [
              {
                title: "Admin",
                items: [
                  {
                    title: "Users",
                    icon: "people",
                    href: "/dashboard/admin/users",
                  },
                  {
                    title: "Applications",
                    icon: "deployed_code",
                    href: "/dashboard/admin/applications",
                  },
                  {
                    title: "Management",
                    icon: "build",
                    href: "/dashboard/admin/management",
                  },
                  {
                    title: "Audit Log",
                    icon: "history",
                    href: `/dashboard/admin/audit-log`,
                  },
                ],
              },
            ]
          : []),
      ]}
      footerItems={[
        {
          title: "Logout",
          icon: "logout",
          href: "#",
          dangerous: true,
          onClick: async () => {
            const notif = notifications.create({
              type: "info",
              text: "Logging out...",
            });

            permafrost.users.sessions
              .delete(permafrost.auth.session!.id)
              .catch((e) => {
                notifications.create({
                  type: "error",
                  text: "Session could not be deleted when signing out. It will need to be removed manually by another session.",
                });
                notif.remove();
              })
              .then(() => {
                browserStorage()?.clear();
                browserStorage(true)?.clear();
                permafrost.auth.logout();

                notif.setType("success");
                notif.setText("Logged out!");

                router.push("/auth");
              });
          },
        },
      ]}
    >
      {children}
    </DashboardBaseLayout>
  );
}
