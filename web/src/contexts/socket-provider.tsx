"use client";

import { User, UserWithMeme } from "@/types";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  usersInRound: User[];
  setUsersInRound: React.Dispatch<React.SetStateAction<User[]>>;
  roundNo: number;
  setRoundNo: React.Dispatch<React.SetStateAction<number>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  roundStarted: boolean;
  setRoundStarted: React.Dispatch<React.SetStateAction<boolean>>;
  memeStarted: boolean;
  setMemeStarted: React.Dispatch<React.SetStateAction<boolean>>;
  player1: UserWithMeme | null;
  setPlayer1: React.Dispatch<React.SetStateAction<UserWithMeme | null>>;
  player2: UserWithMeme | null;
  setPlayer2: React.Dispatch<React.SetStateAction<UserWithMeme | null>>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  setUsers: () => {},
  usersInRound: [],
  setUsersInRound: () => {},
  roundNo: 1,
  setRoundNo: () => {},
  topic: "",
  setTopic: () => {},
  roundStarted: false,
  setRoundStarted: () => {},
  memeStarted: false,
  setMemeStarted: () => {},
  player1: null,
  setPlayer1: () => {},
  player2: null,
  setPlayer2: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }: React.PropsWithChildren) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersInRound, setUsersInRound] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roundNo, setRoundNo] = useState(1);
  const [topic, setTopic] = useState("");
  const [roundStarted, setRoundStarted] = useState(false);
  const [memeStarted, setMemeStarted] = useState(false);
  const [player1, setPlayer1] = useState<UserWithMeme | null>(null);
  const [player2, setPlayer2] = useState<UserWithMeme | null>(null);
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

    socketInstance.on("getUsers", setUsers);
    socketInstance.on("setTopic", setTopic);
    socketInstance.on("setStartRound", () => setRoundStarted(true));
    socketInstance.on("setStartMemeing", () => setMemeStarted(true));
    socketInstance.on("setEndMemeing", () => setMemeStarted(false));
    socketInstance.on("showNextMeme", (player1Data, player2Data) => {
      setPlayer1(player1Data);
      setPlayer2(player2Data);
    });
    socketInstance.on("setNextRound", (roundNo) => {
      setRoundStarted(false);
      setRoundNo(roundNo);
      setTopic("");
    });

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
        usersInRound,
        setUsersInRound,
        topic,
        setTopic,
        roundNo,
        setRoundNo,
        roundStarted,
        setRoundStarted,
        memeStarted,
        setMemeStarted,
        player1,
        setPlayer1,
        player2,
        setPlayer2,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
