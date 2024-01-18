"use client";

import { useSocket } from "@/contexts/socket-provider";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserWithMeme } from "@/types";

type MemeContainerProps = {
  isAdmin?: boolean;
};

type PlayerMemeProps = {
  player: UserWithMeme;
};

export default function MemeContainer({ isAdmin }: MemeContainerProps) {
  const { socket, player1, player2 } = useSocket();

  return (
    <div className="flex min-h-[400px] w-full items-center gap-6">
      <div className="h-full grow bg-red-400">
        {player1 && <PlayerMeme player={player1} />}
      </div>
      <div className="h-[calc(100%+2rem)] w-px bg-slate-200"></div>
      <div className="h-full grow bg-red-400">
        {player2 && <PlayerMeme player={player2} />}
      </div>
    </div>
  );
}

function PlayerMeme({ player }: PlayerMemeProps) {
  return (
    <>
      <Image
        src={player.meme.image}
        alt={`Player 1 Meme: ${player.meme.prompt}`}
        height={400}
        width={400}
      />
      <p className="text-lg font-medium text-slate-500">{player.meme.prompt}</p>
      <Button variant="success-outline">Select</Button>
    </>
  );
}
