"use client";

import { useSocket } from "@/contexts/socket-provider";
import { useEffect, useState } from "react";

export default function VoteBar() {
  const [player1Score, setPlayer1Score] = useState<string | null>(null);
  const [player1VotesCount, setPlayer1VotesCount] = useState<number>(0);
  const [totalVotesCount, setTotalVotesCount] = useState(0);
  const { socket, isConnected, player1, users } = useSocket();
  const [noOfUsersInRound, setNoOfUsersInRound] = useState(users?.length ?? 0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("setNoOfUsersInRound", (res: any) => {
      setNoOfUsersInRound(res.noOfUsersInRound);
    });

    const handleVote = (playerId: string, voteCount: number) => {
      if (player1!.id === playerId) {
        setPlayer1VotesCount((prev) => prev + 1);
      }
      setTotalVotesCount(voteCount);
    };

    socket.on("setVote", handleVote);

    return () => {
      socket.off("setVote", handleVote);
    };
  }, [socket, isConnected, player1]);

  useEffect(() => {
    if (totalVotesCount === 0) return setPlayer1Score(null);
    const score = ((100 * (player1VotesCount + 1)) / totalVotesCount).toFixed(
      2,
    );
    setPlayer1Score(score);
  }, [player1VotesCount, totalVotesCount]);

  return (
    <div className="mt-8 w-full">
      <p className="text-center">
        Votes:{" "}
        <span className="font-semibold text-slate-800">{totalVotesCount}</span>{" "}
        / <span className="text-sm text-slate-500">{noOfUsersInRound}</span>
      </p>
      <div className="mt-2 flex h-8 w-full items-center bg-slate-100">
        {player1Score && (
          <>
            <div
              className="relative h-full bg-blue-400/80"
              style={{ width: player1Score + "%" }}
            >
              <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2 font-semibold text-white">
                {player1Score}% ({player1VotesCount})
              </span>
            </div>
            <div className="relative h-full grow bg-destructive/80">
              <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2 font-semibold text-white">
                {100 - parseFloat(player1Score)}% (
                {totalVotesCount - player1VotesCount})
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
