"use client";

import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import UserListItem from "./user-list-item";
import { useSocket } from "@/contexts/socket-provider";

export default function Sidebar() {
  const { users } = useSocket();

  return (
    <aside className="h-full w-[300px] overflow-y-auto">
      <div className="sticky top-0 z-10 w-full bg-white">
        <h2 className="p-2 py-3 text-center text-xl font-medium">Active Users</h2>
        <hr className="mx-auto w-10/12 border-slate-300" />
      </div>
      <ul className="flex flex-col gap-2 p-2">
        {users?.map((user) => <UserListItem key={user.id} user={user} />)}
      </ul>
    </aside>
  );
}
