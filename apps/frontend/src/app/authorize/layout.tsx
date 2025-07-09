import BackgroundLayout from "@/components/BackgroundLayout";

export const metadata = {
  title: "Authorize - Permafrost",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BackgroundLayout>{children}</BackgroundLayout>;
}
