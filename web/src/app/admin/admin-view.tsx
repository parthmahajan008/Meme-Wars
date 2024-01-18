"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";
import TopicContainer from "@/components/topic-container";
import { Role, User } from "@/types";
import MemeContainer from "@/components/meme-container";
import VoteBar from "@/components/vote-bar";

export default function AdminView() {
  const [remainingTime, setRemainingTime] = useState("");
  const [canStartVotingRound, setCanstartVotingRound] = useState(false);
  const [canGoToNextMeme, setCanGoToNextMeme] = useState(false);
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

  const usersByRole = useMemo(
    () =>
      users?.reduce(
        (prev: Record<Role, User[]>, user: User) => {
          if (user.role in prev) {
            prev[user.role].push(user);
          } else {
            prev[user.role] = [user];
          }
          return prev;
        },
        {} as Record<Role, User[]>,
      ),
    [users],
  );

  const joinAdminRoom = useCallback(async () => {
    if (!socket || !isConnected) return;
    socket.emit("newAdmin");
    socket.on("getUsers", setUsers);
  }, [socket, isConnected, setUsers]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    joinAdminRoom();
    socket.on("setRemainingTime", setRemainingTime);
    socket.on("canStartVotingRound", setCanstartVotingRound);
    socket.on("canGoToNextMeme", setCanGoToNextMeme);
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

  const startVotingRound = useCallback(
    async (roundNo: number) => {
      if (!socket || !isConnected) return;
      const players = usersByRole[Role.PLAYER] ?? [];
      socket.emit("startVotingRound", roundNo, players);
    },
    [socket, isConnected, usersByRole],
  );

  const nextMeme = useCallback(
    async (roundNo: number) => {
      if (!socket || !isConnected) return;
      socket.emit("nextMeme", roundNo);
    },
    [socket, isConnected],
  );

  return (
    <div className="flex grow flex-col items-center justify-center overflow-auto p-4">
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
            {!memeStarted && !canStartVotingRound && (
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
          {!memeStarted && !canStartVotingRound && (
            <Button
              className="mt-32"
              disabled={topic === "" || isTopicLoading}
              size="lg"
              onClick={() => startMemeing(roundNo)}
            >
              Start Memeing
            </Button>
          )}
          {canStartVotingRound && !canGoToNextMeme && (
            <Button
              className="mt-32"
              size="lg"
              onClick={() => startVotingRound(roundNo)}
            >
              Start Voting
            </Button>
          )}
          {canStartVotingRound && canGoToNextMeme && (
            <div className="mt-16 flex w-full flex-col items-center gap-8 px-16">
              <VoteBar />
              <MemeContainer isAdmin />
              <Button
                className="mt-16"
                size="lg"
                onClick={() => nextMeme(roundNo)}
              >
                Next Meme
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
