"use client";

import { User } from "@/types";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  setUsers: () => {},
  topic: "",
  setTopic: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }: React.PropsWithChildren) {
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [topic, setTopic] = useState("");
  const { user } = useKindeBrowserClient();

  useEffect(() => {
    if (!user) return;

    const socketInstance: Socket = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      { path: "/api/socket/io", addTrailingSlash: false },
    );

    socketInstance.on("connect", async () => {
      setIsConnected(true);
      socketInstance.emit("newUser", user);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      socketInstance.emit("removeUser", user);
    });

    socketInstance.on("setTopic", setTopic);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, users, setUsers, topic, setTopic }}
    >
      {children}
    </SocketContext.Provider>
  );
}
