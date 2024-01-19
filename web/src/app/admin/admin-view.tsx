"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ReloadIcon } from "@radix-ui/react-icons";
import TopicContainer from "@/components/topic-container";
import { Role, User, UserWithMeme } from "@/types";
import MemeContainer from "@/components/meme-container";
import VoteBar from "@/components/vote-bar";
import PlayerMeme from "@/components/player-meme";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function AdminView() {
  const [remainingTime, setRemainingTime] = useState("");
  const [canStartVotingRound, setCanstartVotingRound] = useState(false);
  const [canGoToNextMeme, setCanGoToNextMeme] = useState(false);
  const [showNextRoundPlayers, setShowNextRoundPlayers] = useState(false);
  const [nextRoundPlayers, setNextRoundPlayers] = useState<UserWithMeme[]>([]);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const {
    isConnected,
    socket,
    users,
    setUsers,
    topic,
    roundNo,
    roundStarted,
    memeStarted,
    player1,
    player2,
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
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    joinAdminRoom();
    socket.on("setRemainingTime", setRemainingTime);
    socket.on("canStartVotingRound", setCanstartVotingRound);
    socket.on("canGoToNextMeme", setCanGoToNextMeme);
    socket.on("setShowNextRoundPlayers", setShowNextRoundPlayers);
  }, [socket, isConnected, joinAdminRoom]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (showNextRoundPlayers) {
      socket.emit("setNextRoundPlayers", roundNo + 1, (res: any) =>
        setNextRoundPlayers(res.nextRoundPlayers),
      );
    } else {
      setNextRoundPlayers([]);
    }
  }, [socket, isConnected, showNextRoundPlayers]);

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
      const timer = minutes * 60 + seconds;
      socket.emit("startMemeing", roundNo, timer);
    },
    [socket, isConnected, minutes, seconds],
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

  const goToNextRound = useCallback(
    (roundNo: number) => {
      if (!socket || !isConnected) return;

      socket.emit("goToNextRound", roundNo);
    },
    [socket, isConnected],
  );

  const isVoting = player1 !== null || player2 !== null;

  return (
    <div
      className={cn(
        "flex grow flex-col items-center overflow-auto p-4",
        clsx({ "justify-center": !showNextRoundPlayers }),
      )}
    >
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
            {!memeStarted && !canStartVotingRound && !showNextRoundPlayers && (
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
          {!memeStarted && !canStartVotingRound && !showNextRoundPlayers && (
            <div className="mt-32 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.valueAsNumber)}
                  placeholder="00"
                  min={0}
                  max={59}
                  className="w-24"
                />
                <Input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.valueAsNumber)}
                  placeholder="00"
                  min={0}
                  max={59}
                  className="w-24"
                />
              </div>
              <Button
                disabled={topic === "" || isTopicLoading}
                size="lg"
                onClick={() => startMemeing(roundNo)}
              >
                Start Memeing
              </Button>
            </div>
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
              {isVoting && (
                <>
                  <VoteBar />
                  <MemeContainer isAdmin />
                </>
              )}
              <Button
                className="mt-16"
                size="lg"
                onClick={() => nextMeme(roundNo)}
              >
                Next Meme
              </Button>
            </div>
          )}
          {showNextRoundPlayers && (
            <div className="mt-16 flex w-full flex-col items-center gap-8 px-16">
              <Button
                className="mt-16"
                size="lg"
                onClick={() => goToNextRound(roundNo)}
              >
                Go To Next Round
              </Button>
              <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {nextRoundPlayers.map((player) => (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-4">
                    <p className="mb-4 text-lg font-semibold">
                      {player.given_name} {player.family_name}
                    </p>
                    <PlayerMeme player={player} isAdmin isReadOnly />
                  </div>
                ))}
                {nextRoundPlayers.map((player) => (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-4">
                    <p className="mb-4 text-lg font-semibold">
                      {player.given_name} {player.family_name}
                    </p>
                    <PlayerMeme player={player} isAdmin isReadOnly />
                  </div>
                ))}
                {nextRoundPlayers.map((player) => (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-4">
                    <p className="mb-4 text-lg font-semibold">
                      {player.given_name} {player.family_name}
                    </p>
                    <PlayerMeme player={player} isAdmin isReadOnly />
                  </div>
                ))}
                {nextRoundPlayers.map((player) => (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-4">
                    <p className="mb-4 text-lg font-semibold">
                      {player.given_name} {player.family_name}
                    </p>
                    <PlayerMeme player={player} isAdmin isReadOnly />
                  </div>
                ))}
                {nextRoundPlayers.map((player) => (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-4">
                    <p className="mb-4 text-lg font-semibold">
                      {player.given_name} {player.family_name}
                    </p>
                    <PlayerMeme player={player} isAdmin isReadOnly />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
