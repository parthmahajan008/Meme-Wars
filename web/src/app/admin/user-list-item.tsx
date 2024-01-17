import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Role } from "@/types";

type UserListItemProps = {
  user: User;
};

export default function UserListItem({ user }: UserListItemProps) {
  const { given_name, family_name, email, picture } = user;
  const name = `${given_name} ${family_name}`;

  return (
    <li className="flex cursor-pointer items-center gap-4 rounded-md px-3 py-1 hover:bg-slate-100">
      <Avatar>
        <AvatarImage src={picture ?? ""} />
        <AvatarFallback>
          {given_name?.[0].toUpperCase()}
          {family_name?.[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs">{email}</p>
      </div>
    </li>
  );
}
