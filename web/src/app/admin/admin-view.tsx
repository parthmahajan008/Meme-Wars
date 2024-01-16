"use client";

import { useSocket } from "@/contexts/socket-provider";

export default function AdminView() {
  const { isConnected } = useSocket();

  return (
    <div className="grow bg-blue-400">
      {isConnected ? "Connected" : "Connecting..."}
    </div>
  );
}
