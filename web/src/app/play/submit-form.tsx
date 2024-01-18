"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon, File, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { useSocket } from "@/contexts/socket-provider";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  url: z.string().min(1),
  prompt: z.string().min(20),
});

export const SubmitForm = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const submitMeme = useCallback(() => {
    if (!socket || !isConnected) return;

    socket.emit("submitMeme", imageUrl, prompt, (res: any) => {
      if (res.submitted) {
        toast({ title: "Meme Submitted!" });
      } else {
        toast({ title: "Something went wrong!", variant: "destructive" });
      }
    });
  }, [socket, isConnected, imageUrl, prompt]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values.url);
      toast({ title: "Meme uploaded" });
      setImageUrl(values.url);
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-md border p-4 shadow-sm shadow-slate-100">
      {imageUrl && (
        <div className="relative flex h-[400px] items-center justify-between rounded-md border border-sky-200 bg-slate-50 p-3">
          {imageUrl && (
            <Image
              src={`${imageUrl}`}
              alt="Submission Image"
              className="mx-auto h-full w-full"
              height={400}
              width={400}
            />
          )}
          <Button
            variant="ghost"
            onClick={() => setImageUrl("")}
            className="transition hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!imageUrl && (
        <>
          <div className="flex items-center justify-between font-medium">
            Upload your Meme
            <Button onClick={toggleEdit} variant="ghost">
              {isEditing && <>Cancel</>}
              {!isEditing && (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add a file
                </>
              )}
            </Button>
          </div>
          <div>
            <FileUpload
              endpoint="image"
              onChange={(url) => {
                if (url) {
                  setImageUrl(url);
                  // onSubmit({ url: url });
                }
              }}
            />
            <div className="mt-4 text-xs text-muted-foreground">
              Drag and Drop Your Meme Submission here
            </div>
          </div>
        </>
      )}

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Moye Moye"
        className="mt-6"
      />
      <Button
        size="lg"
        disabled={!imageUrl || !prompt}
        className="mt-4 w-full"
        onClick={submitMeme}
      >
        Submit Meme
      </Button>
    </div>
  );
};
