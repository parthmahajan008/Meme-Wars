"use client";

import { useSocket } from "@/contexts/socket-provider";

export default function TopicContainer({ children }: React.PropsWithChildren) {
  const { topic } = useSocket();

  return (
    <div className="text-center">
      <p className="mb-2 font-medium text-slate-500">Topic</p>
      {topic && (
        <p className="font-slate-700 mb-4 text-3xl font-semibold">{topic}</p>
      )}
      {children}
    </div>
  );
}
