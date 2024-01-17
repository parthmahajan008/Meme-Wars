import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "../../../../types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";

export const config = {
  api: {
    bodyParse: false,
  },
};

async function getUsers(io: ServerIO) {
  const sockets = await io.fetchSockets();
  const rooms = io.sockets.adapter.rooms.keys();
  const users = [...rooms]
    .filter((room) => room.includes("user:"))
    .map((room) => {
      const userId = room.split(":")[1];
      return sockets.find((s) => s.data.user && s.data.user.id === userId)!.data
        .user;
    });

  return users;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

    io.on("connection", async (socket) => {
      socket.on("newUser", async (user) => {
        console.log("[NEW USER]");
        await socket.join(`user:${user.id}`);
        socket.data.user = user;
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);
      });

      socket.on("newAdmin", async () => {
        console.log("[NEW ADMIN]");
        await socket.join("admin");
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
