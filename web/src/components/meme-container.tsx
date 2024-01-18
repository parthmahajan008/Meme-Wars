"use client";

import { useSocket } from "@/contexts/socket-provider";
import { useState } from "react";
import PlayerMeme from "@/components/player-meme";

type MemeContainerProps = {
  isAdmin?: boolean;
};

export default function MemeContainer({ isAdmin = false }: MemeContainerProps) {
  const [voteCasted, setVoteCasted] = useState(false);
  const { player1, player2 } = useSocket();

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
