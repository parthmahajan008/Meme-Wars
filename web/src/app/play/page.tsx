"use client";

import TopicContainer from "@/components/topic-container";
import { useSocket } from "@/contexts/socket-provider";
import RoundLoading from "./round-loading";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

export default function PlayPage() {
  const [redirectToNotFound, setRedirectToNotFound] = useState(false);
  const { socket, isConnected, topic, roundNo, roundStarted } = useSocket();

  if (redirectToNotFound) notFound();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit("checkRoom", `round:${roundNo}`, (res: any) => {
      setRedirectToNotFound(!res.data);
    });
  }, [socket, roundNo, isConnected]);

  return (
    <main className="h-screen">
      {!roundStarted && <RoundLoading />}
      {roundStarted && (
        <div className="p-4">
          <TopicContainer />
        </div>
      )}
    </main>
  );
}
