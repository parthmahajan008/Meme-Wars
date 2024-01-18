
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
    const { isAuthenticated, getUser } = getKindeServerSession();
    const [authenticated, user] = await Promise.all([
        isAuthenticated(),
        getUser(),
    ]);
    if (!user || !authenticated) throw new Error("Unauthorized");
    return { userId: user.id };
}

export const ourFileRouter = {
    image: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);
        return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;