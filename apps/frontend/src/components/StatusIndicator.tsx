"use client";

import { useMetadata } from "@/contexts/MetadataContext";

const statusColors = {
  connected: "#20fea1",
  disconnected: "#ff4f4f",
  loading: "#ffbf42",
};

export default function StatusIndicator() {
  const metadata = useMetadata();

  return (
    <div className="flex flex-row items-center gap-1">
      <div
        style={{
          background: `${statusColors[metadata.state]}60`,
          borderRadius: "100%",
          width: "16px",
          height: "16px",
        }}
      >
        {" "}
        <div
          style={{
            background: `${statusColors[metadata.state]}`,
            borderRadius: "100%",
            width: "10px",
            height: "10px",
            position: "relative",
            left: "3px",
            top: "3px",
          }}
        ></div>
      </div>{" "}
      {metadata.state === "connected"
        ? "Online"
        : metadata.state === "loading"
        ? "Loading..."
        : "Offline"}
    </div>
  );
}
