"use client";

import { useSocket } from "@/contexts/socket-provider";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserWithMeme } from "@/types";
import { useCallback, useState } from "react";

type MemeContainerProps = {
  isAdmin?: boolean;
};

type PlayerMemeProps = {
  player: UserWithMeme;
  isAdmin?: boolean;
  player1?: boolean;
  voteCasted: boolean;
  setVoteCasted: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MemeContainer({ isAdmin = false }: MemeContainerProps) {
  const [voteCasted, setVoteCasted] = useState(false);
  const { socket, player1, player2 } = useSocket();

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center gap-6 lg:flex-row">
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
        {player1 && (
          <PlayerMeme
            player={player1}
            isAdmin={isAdmin}
            player1
            voteCasted={voteCasted}
            setVoteCasted={setVoteCasted}
          />
        )}
      </div>
      <div className="h-px w-[calc(100%+2rem)] bg-slate-200 lg:h-[calc(100%+2rem)] lg:w-px"></div>
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
        {player2 && (
          <PlayerMeme
            player={player2}
            isAdmin={isAdmin}
            voteCasted={voteCasted}
            setVoteCasted={setVoteCasted}
          />
        )}
      </div>
    </div>
  );
}

function PlayerMeme({
  player,
  isAdmin = false,
  player1 = false,
  voteCasted,
  setVoteCasted,
}: PlayerMemeProps) {
  const { socket, isConnected, roundNo } = useSocket();

  const handleVote = useCallback(() => {
    if (!socket || !isConnected) return;

    socket.emit("vote", roundNo, player, (res: any) => {
      setVoteCasted(res.submitted);
    });
  }, [socket, isConnected]);

  return (
    <>
      <Image
        src={player.meme.imageUrl}
        alt={`${player.meme.prompt}`}
        height={400}
        width={400}
      />
      <p className="text-lg font-medium text-slate-500">{player.meme.prompt}</p>
      {isAdmin && (
        <Button variant="success-outline" className="text-lg" size="lg">
          Select
        </Button>
      )}
      {!isAdmin && (
        <Button
          variant={player1 ? "blue-outline" : "destructive-outline"}
          className="w-full text-lg"
          size="lg"
          disabled={voteCasted}
          onClick={() => handleVote()}
        >
          Vote
        </Button>
      )}
    </>
  );
}
