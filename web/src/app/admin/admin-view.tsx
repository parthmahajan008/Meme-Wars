"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";
import TopicContainer from "@/components/topic-container";

export default function AdminView() {
  const [remainingTime, setRemainingTime] = useState("");
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const {
    isConnected,
    socket,
    users,
    setUsers,
    topic,
    roundNo,
    roundStarted,
    memeStarted,
  } = useSocket();

  const joinAdminRoom = useCallback(async () => {
    if (!socket || !isConnected) return;
    socket.emit("newAdmin");
    socket.on("getUsers", setUsers);
  }, [socket, isConnected, setUsers]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    joinAdminRoom();
    socket.on("setRemainingTime", setRemainingTime);
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
    setIsTopicLoading(true);
    const res = await axios.get("/api/generate/topic");
    const topic = res.data.topic;
    socket.emit("newTopic", topic);
    setIsTopicLoading(false);
  }, [socket, isConnected]);

  const startMemeing = useCallback(
    async (roundNo: number) => {
      if (!socket || !isConnected) return;
      socket.emit("startMemeing", roundNo);
    },
    [socket, isConnected],
  );

  return (
    <div className="flex grow flex-col items-center justify-center p-4">
      {memeStarted && (
        <div className="mb-16 text-center text-7xl font-medium">
          {remainingTime}
        </div>
      )}
      {!roundStarted && (
        <>
          <p className="mx-auto w-fit bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-7xl font-bold text-transparent">
            Round {roundNo}
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => startRound(roundNo)}
          >
            Start Round
          </Button>
        </>
      )}
      {roundStarted && (
        <>
          <TopicContainer>
            {!memeStarted && (
              <Button
                disabled={isTopicLoading}
                size="lg"
                onClick={generateNewTopic}
              >
                {isTopicLoading && (
                  <ReloadIcon className="mr-2 aspect-square h-5 animate-spin" />
                )}
                Generate New Topic
              </Button>
            )}
          </TopicContainer>
          {!memeStarted && (
            <Button
              className="mt-32"
              disabled={topic === "" || isTopicLoading}
              size="lg"
              onClick={() => startMemeing(roundNo)}
            >
              Start Memeing
            </Button>
          )}
        </>
      )}
    </div>
  );
}
