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
  roundNo: number;
  setRoundNo: React.Dispatch<React.SetStateAction<number>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  roundStarted: boolean;
  setRoundStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  setUsers: () => {},
  roundNo: 1,
  setRoundNo: () => {},
  topic: "",
  setTopic: () => {},
  roundStarted: false,
  setRoundStarted: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }: React.PropsWithChildren) {
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roundNo, setRoundNo] = useState(1);
  const [topic, setTopic] = useState("");
  const [roundStarted, setRoundStarted] = useState(false);
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
    socketInstance.on("setStartRound", () => setRoundStarted(true));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        users,
        setUsers,
        topic,
        setTopic,
        roundNo,
        setRoundNo,
        roundStarted,
        setRoundStarted,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
