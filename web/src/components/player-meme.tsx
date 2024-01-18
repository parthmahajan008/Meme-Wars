import { useSocket } from "@/contexts/socket-provider";
import { UserWithMeme } from "@/types";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type PlayerMemeProps = {
  player: UserWithMeme;
  isAdmin?: boolean;
  isReadOnly?: boolean;
  player1?: boolean;
  voteCasted?: boolean;
  setVoteCasted?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PlayerMeme({
  player,
  isAdmin = false,
  isReadOnly = false,
  player1 = false,
  voteCasted = false,
  setVoteCasted = () => {},
}: PlayerMemeProps) {
  const { socket, isConnected, roundNo } = useSocket();

  const handleVote = useCallback(
    (roundNo: number) => {
      if (!socket || !isConnected) return;

      socket.emit("vote", roundNo, player, (res: any) => {
        setVoteCasted(res.submitted);
      });
    },
    [socket, isConnected],
  );

  return (
    <>
      <Image
        src={player.meme.imageUrl}
        alt={`${player.meme.prompt}`}
        height={400}
        width={400}
      />
      <p className="text-lg font-medium text-slate-500">{player.meme.prompt}</p>
      {isReadOnly && (
        <>
          {!isAdmin && (
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
              onClick={() => handleVote(roundNo)}
            >
              Vote
            </Button>
          )}
        </>
      )}
    </>
  );
}
