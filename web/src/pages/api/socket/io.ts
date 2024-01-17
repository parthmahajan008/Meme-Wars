import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

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
        socket.data.user = { ...user, role: "PLAYER" };
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);
      });

      socket.on("newAdmin", async () => {
        console.log("[NEW ADMIN]");
        await socket.join("admin");
        const user = socket.data.user;
        socket.data.user = { ...user, role: "ADMIN" };
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);
      });

      socket.on("disconnect", async () => {
        console.log("[REMOVE USER]");
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);
      });

      socket.on("newTopic", (topic) => {
        io.emit("setTopic", topic);
      });

      socket.on("newRound", (roundNo) => {
        socket.join(`round:${roundNo}`);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
