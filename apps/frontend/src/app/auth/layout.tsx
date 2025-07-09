import LoginMain from "@/components/LoginMain";
import LayoutClient from "./layout-client";
import Loader from "@/components/Loader";

export const metadata = {
  title: "Login - Permafrost",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
