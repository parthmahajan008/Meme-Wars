"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function AdminView() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, socket, users, setUsers } = useSocket();

  const joinAdminRoom = useCallback(async () => {
    if (!socket || !isConnected) return;
    socket.emit("newAdmin");
    socket.on("getUsers", setUsers);
  }, [socket, isConnected, setUsers]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    joinAdminRoom();
  }, [socket, isConnected, joinAdminRoom]);

  const startRound = useCallback(
    async (roundNo: number) => {
      if (!socket || !isConnected) return;
      socket.emit("newRound", roundNo);
    },
    [socket, isConnected],
  );

  async function generateNewTopic() {
    setIsLoading(true);
    const res = await axios.get("/api/generate/topic");
    setTopic(res.data.topic);
    setIsLoading(false);
  }

  return (
    <div className="grow">
      <div className="text-center">
        <p className="mb-2 font-medium text-slate-500">Topic</p>
        {topic && (
          <p className="font-slate-700 mb-4 text-3xl font-semibold">{topic}</p>
        )}
        <Button
          disabled={isLoading}
          size="lg"
          onClick={() => generateNewTopic()}
        >
          {isLoading && (
            <ReloadIcon className="mr-2 aspect-square h-5 animate-spin" />
          )}
          Generate New Topic
        </Button>
      </div>
      <Button size="lg" onClick={() => startRound(1)}>
        Start Round
      </Button>
    </div>
  );
}
