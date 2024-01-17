import { ReloadIcon } from "@radix-ui/react-icons";

export default function RoundLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <ReloadIcon className="mb-8 h-10 w-10 animate-spin text-xl text-slate-700" />
      <span className="text-lg font-semibold text-slate-600">
        Waiting for the host to start the round...
      </span>
    </div>
  );
}
