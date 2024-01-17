"use client";

import TopicContainer from "@/components/topic-container";
import { useSocket } from "@/contexts/socket-provider";

export default function PlayPage() {
  const { topic } = useSocket();
  return (
    <main>
      <div>Play</div>
      <TopicContainer />
    </main>
  );
}
