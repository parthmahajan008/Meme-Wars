import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";

type UserListItemProps = {
  user: KindeUser;
};

export default function UserListItem({ user }: UserListItemProps) {
  const name = `${user.given_name} ${user.family_name}`;

  return (
    <li className="flex cursor-pointer items-center gap-4 rounded-md px-3 py-1 hover:bg-slate-100">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs">{user.email}</p>
      </div>
    </li>
  );
}
