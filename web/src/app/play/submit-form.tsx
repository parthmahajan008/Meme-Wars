"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon, File, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { Toast } from "@/components/ui/toast";

const formSchema = z.object({
  url: z.string().min(1),
  prompt: z.string().min(20),
});

export const SubmitForm = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values.url);
      Toast({ title: "Meme uploaded" });
      setImageUrl(values.url);
      router.refresh();
    } catch {
      Toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-xl rounded-md border p-4 shadow-sm shadow-slate-100">
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
    </div>
  );
};
