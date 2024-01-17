"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";
import TopicContainer from "@/components/topic-container";

export default function AdminView() {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, socket, users, setUsers, topic, setTopic } = useSocket();

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

  const generateNewTopic = useCallback(async () => {
    if (!socket || !isConnected) return;
    setIsLoading(true);
    const res = await axios.get("/api/generate/topic");
    const topic = res.data.topic;
    socket.emit("newTopic", topic);
    setIsLoading(false);
  }, [socket, isConnected]);

  return (
    <div className="grow">
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
      <Button size="lg" onClick={() => startRound(1)}>
        Start Round
      </Button>
    </div>
  );
}
