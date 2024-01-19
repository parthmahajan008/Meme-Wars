import { useSocket } from "@/contexts/socket-provider";
import { UserWithMeme } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlayerMemeProps = {
  player: UserWithMeme;
  isAdmin?: boolean;
  isReadOnly?: boolean;
  player1?: boolean;
  voteCasted?: boolean;
  setVoteCasted?: React.Dispatch<React.SetStateAction<boolean>>;
  isSelected?: boolean;
  setIsSelected?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PlayerMeme({
  player,
  isAdmin = false,
  isReadOnly = false,
  player1 = false,
  voteCasted = false,
  setVoteCasted = () => {},
}: PlayerMemeProps) {
  const [isSelected, setIsSelected] = useState(false);
  const { socket, isConnected, roundNo, player2 } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on("setSelect", (playerId, selected) => {
      if (player.id === playerId) setIsSelected(selected);
    });
  }, [socket, isConnected]);

  const handleVote = useCallback(
    (roundNo: number, player: UserWithMeme) => {
      if (!socket || !isConnected) return;

      socket.emit("vote", roundNo, player, (res: any) => {
        setVoteCasted(res.submitted);
      });
    },
    [socket, isConnected],
  );

  const handleSelect = useCallback(
    (roundNo: number) => {
      if (!socket || !isConnected) return;

      socket.emit("select", roundNo, player, !isSelected);
    },
    [socket, isConnected, isSelected],
  );

  return (
    <>
      <Image
        src={player?.meme?.imageUrl}
        alt={`${player?.meme?.prompt}`}
        height={400}
        width={400}
      />
      <p className="text-lg font-medium text-slate-500">
        {player?.meme?.prompt}
      </p>
      {!isReadOnly && (
        <>
          {isAdmin && (
            <Button
              variant="success-outline"
              className={cn("w-full text-lg", {
                "bg-green-500 text-white hover:bg-green-500/80": isSelected,
              })}
              size="lg"
              onClick={() => handleSelect(roundNo)}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          )}
          {!isAdmin && (
            <div className="flex w-full items-center justify-center gap-4">
              <Button
                variant={player1 ? "blue-outline" : "destructive-outline"}
                className="w-full text-lg"
                size="lg"
                disabled={voteCasted}
                onClick={() => handleVote(roundNo, player)}
              >
                Vote
              </Button>
              {!player2 && (
                <Button
                  variant="destructive-outline"
                  className="w-full text-lg"
                  size="lg"
                  disabled={voteCasted}
                  onClick={() => handleVote(roundNo, { ...player, id: "abcd" })}
                >
                  Vote
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
