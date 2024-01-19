"use client";

import { Role, User } from "@/types";
import UserListItem from "./user-list-item";
import { useSocket } from "@/contexts/socket-provider";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const { users, isConnected, socket } = useSocket();

  const usersByRole = useMemo(
    () =>
      users?.reduce(
        (prev: Record<Role, User[]>, user: User) => {
          if (user.role in prev) {
            prev[user.role].push(user);
          } else {
            prev[user.role] = [user];
          }
          return prev;
        },
        {} as Record<Role, User[]>,
      ),
    [users],
  );

  const admins = usersByRole[Role.ADMIN];
  const players = usersByRole[Role.PLAYER];
  const reset = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit("reset");
  }, [socket, isConnected]);
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto shadow-lg">
      <div className="sticky top-0 z-10 w-full bg-white">
        <h2 className="p-2 py-3 text-center text-xl font-medium">
          Active Users
        </h2>
        <hr className="mx-auto w-10/12 border-slate-300" />
      </div>
      <ul className="flex flex-col gap-2 p-2">
        <li>
          <span className="mb-4 ml-2 text-xs font-medium text-slate-500">
            Admins ({admins?.length ?? 0})
          </span>
        </li>
        {admins?.map((admin) => <UserListItem key={admin.id} user={admin} />)}
        <li>
          <span className="mb-4 ml-2 text-xs font-medium text-slate-500">
            Players ({players?.length ?? 0})
          </span>
        </li>
        {players?.map((player) => (
          <UserListItem key={player.id} user={player} />
        ))}
      </ul>
      <div className="sticky bottom-0 mt-auto bg-white p-2">
        {isConnected ? (
          <Badge variant="success-outline" className="px-4 py-1">
            Connected
          </Badge>
        ) : (
          <Badge variant="destructive-outline" className="px-4 py-1">
            Connecting...
          </Badge>
        )}
        <Button onClick={() => reset()}>Reset</Button>
      </div>
    </aside>
  );
}
