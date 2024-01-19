"use client";

import TopicContainer from "@/components/topic-container";
import { useSocket } from "@/contexts/socket-provider";
import RoundLoading from "./round-loading";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { SubmitForm } from "./submit-form";
import MemeContainer from "@/components/meme-container";
import VoteBar from "@/components/vote-bar";
import NotFound from "./not-found";

export default function PlayPage() {
  const [remainingTime, setRemainingTime] = useState("");
  const [redirectToNotFound, setRedirectToNotFound] = useState(false);
  const {
    socket,
    isConnected,
    roundNo,
    roundStarted,
    memeStarted,
    player1,
    player2,
  } = useSocket();

  const isVoting = player1 !== null || player2 !== null;

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit("checkRoom", `round:${roundNo}`, (res: any) => {
      setRedirectToNotFound(!res.data);
    });
    socket.on("setRemainingTime", setRemainingTime);
  }, [socket, roundNo, isConnected]);

  if (redirectToNotFound && !isVoting) return <NotFound />;

  return (
    <main className="h-screen">
      {!roundStarted && <RoundLoading />}
      {roundStarted && (
        <div className="p-4">
          {memeStarted && (
            <div className="mb-4 text-center text-2xl font-medium">
              {remainingTime}
            </div>
          )}
          <TopicContainer />
          {memeStarted && <SubmitForm />}
          {isVoting && (
            <div className="mt-16 flex w-full flex-col items-center gap-8 px-16">
              <VoteBar />
              <MemeContainer />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
