"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";
import TopicContainer from "@/components/topic-container";

export default function AdminView() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    isConnected,
    socket,
    users,
    setUsers,
    topic,
    setTopic,
    roundNo,
    roundStarted,
    setRoundStarted,
  } = useSocket();

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
      socket.emit("startRound", roundNo);
    },
    [socket, isConnected],
  );

  const generateNewTopic = useCallback(async () => {
    if (!socket || !isConnected) return;
    setIsLoading(true);
    const res = await axios.get("/api/generate/topic");
    const topic = res.data.topic;
    socket.emit("newTopic", topic);
    setIsLoading(false);
  }, [socket, isConnected]);

  return (
    <div className="flex grow flex-col items-center justify-center p-4">
      {!roundStarted && (
        <>
          <p className="mx-auto w-fit bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-7xl font-bold text-transparent">
            Round {roundNo}
          </p>
          <Button size="lg" className="mt-8" onClick={() => startRound(1)}>
            Start Round
          </Button>
        </>
      )}
      {roundStarted && (
        <>
          <TopicContainer>
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
          </TopicContainer>
          <Button className="mt-32">Start Memeing</Button>
        </>
      )}
    </div>
  );
}
