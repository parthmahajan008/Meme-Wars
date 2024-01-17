"use client";

import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect } from "react";

export default function AdminView() {
  const { isConnected, socket, setUsers } = useSocket();

  const joinAdminRoom = useCallback(async () => {
    if (!socket || !isConnected) return;
    socket.emit("newAdmin");
    socket.on("getUsers", setUsers);
  }, [socket, isConnected, setUsers]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    joinAdminRoom();
  }, [socket, isConnected, joinAdminRoom]);

  return (
    <div className="grow bg-blue-400">
      {isConnected ? "Connected" : "Connecting..."}
    </div>
  );
}
