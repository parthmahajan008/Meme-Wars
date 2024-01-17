"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: KindeUser[];
  setUsers: React.Dispatch<React.SetStateAction<KindeUser[]>>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  setUsers: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }: React.PropsWithChildren) {
  const [users, setUsers] = useState<KindeUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, users, setUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
