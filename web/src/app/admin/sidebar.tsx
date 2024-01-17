"use client";

import { Role, User } from "@/types";
import UserListItem from "./user-list-item";
import { useSocket } from "@/contexts/socket-provider";
import { useMemo } from "react";

export default function Sidebar() {
  const { users } = useSocket();
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

  return (
    <aside className="h-full w-[300px] overflow-y-auto">
      <div className="sticky top-0 z-10 w-full bg-white">
        <h2 className="p-2 py-3 text-center text-xl font-medium">
          Active Users
        </h2>
        <hr className="mx-auto w-10/12 border-slate-300" />
      </div>
      <ul className="flex flex-col gap-2 p-2">
        <li>
          <span className="mb-4 text-xs">Admins</span>
        </li>
        {admins?.map((admin) => <UserListItem key={admin.id} user={admin} />)}
        <li>
          <span className="mb-4 text-xs">Players</span>
        </li>
        {players?.map((player) => (
          <UserListItem key={player.id} user={player} />
        ))}
      </ul>
    </aside>
  );
}
