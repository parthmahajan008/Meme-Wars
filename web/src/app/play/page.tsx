"use client";

import TopicContainer from "@/components/topic-container";
import { useSocket } from "@/contexts/socket-provider";
import RoundLoading from "./round-loading";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

export default function PlayPage() {
  const [remainingTime, setRemainingTime] = useState("");
  const [redirectToNotFound, setRedirectToNotFound] = useState(false);
  const { socket, isConnected, topic, roundNo, roundStarted, memeStarted } =
    useSocket();

  if (redirectToNotFound) notFound();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit("checkRoom", `round:${roundNo}`, (res: any) => {
      setRedirectToNotFound(!res.data);
    });
    socket.on("setRemainingTime", setRemainingTime);
  }, [socket, roundNo, isConnected]);

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
          {memeStarted && <div>MEMEING</div>}
        </div>
      )}
    </main>
  );
}
