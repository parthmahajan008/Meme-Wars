import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) redirect("/play");

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center">
      <Image
        src="/bg.jpeg"
        alt="Background Image"
        fill
        className="inset-0 -z-50 object-cover"
      />
      <Image
        src=""
        alt="NSUT.AI Logo"
        className="fixed"
        height={10}
        width={10}
      />
      <div className="absolute inset-0 -z-10 bg-black/20" aria-hidden />
      <div className="flex flex-col items-center gap-10 rounded-xl bg-black/10 p-6 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <h1 className="text-center text-lg font-medium text-slate-100">
          Welcome to <br />
          <span className="text-6xl font-bold text-slate-50">Meme Wars</span>
        </h1>
        <Button className="w-full" size="lg" asChild>
          <RegisterLink>Register to Play</RegisterLink>
        </Button>
      </div>
    </main>
  );
}
