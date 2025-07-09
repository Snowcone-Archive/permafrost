import Loader from "@/components/Loader";
import LoginMain from "@/components/LoginMain";
import { type Metadata, type Viewport } from "next";
import RootClient from "./client";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Permafrost",
  description: "Authentication gateway for Snowflake users.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function Home() {
  return (
    <LoginMain>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <Loader center />
      <RootClient />
      <div></div>
    </LoginMain>
  );
}
