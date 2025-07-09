import "@/app/globals.css";
import DashboardSidebar from "./Sidebar";

export const metadata = {
  title: "Dashboard - Permafrost",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
