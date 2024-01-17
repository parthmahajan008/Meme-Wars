import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import BackButton from "./back-button";
import Sidebar from "./sidebar";
import AdminView from "./admin-view";
import { useSocket } from "@/contexts/socket-provider";

export default async function AdminPage() {
  const { isAuthenticated, getPermission, getUser } = getKindeServerSession();
  const [authenticated, hasAdminPermission, user] = await Promise.all([
    isAuthenticated(),
    getPermission("admin"),
    getUser(),
  ]);

  if (!authenticated || !user) redirect("/");

  if (!hasAdminPermission)
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-xl">You don&apos;t have admin permissions</h1>
        <BackButton>Go Back</BackButton>
      </main>
    );

  return (
    <main className="flex h-screen">
      <AdminView />
      <Sidebar />
    </main>
  );
}
