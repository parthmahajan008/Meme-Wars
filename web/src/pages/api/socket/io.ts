import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import { CountdownTimer } from "@/lib/countdown-timer";

export const config = {
  api: {
    bodyParse: false,
  },
};

const ROUND_DURATION = 60; // in seconds
let roundStarted = false;
let roundTopic = "";
let startMemeing = false;
let timer: CountdownTimer;

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
        // TODO: Check if user rooms exists, if it exists then take the round room from there
        await socket.join([`user:${user.id}`, "round:1"]);
        socket.data.user = { ...user, role: "PLAYER" };
        const users = await getUsers(io);
        io.in("admin").emit("getUsers", users);

        if (roundStarted) {
          socket.emit("setStartRound");
          socket.emit("setTopic", roundTopic);

          if (startMemeing) {
            socket.emit("setStartMemeing");
            socket.emit("setRemainingTime", timer.getRemainingTime());
          }
        }
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

      socket.on("checkRoom", (room, callback) => {
        callback({ status: "ok", data: socket.rooms.has(room) });
      });

      socket.on("newTopic", (topic) => {
        roundTopic = topic;
        io.emit("setTopic", topic);
      });

      socket.on("startRound", (roundNo) => {
        roundStarted = true;
        io.in(`round:${roundNo}`).in("admin").emit("setStartRound");
      });

      socket.on("startMemeing", (roundNo) => {
        startMemeing = true;
        io.in(`round:${roundNo}`).in("admin").emit("setStartMemeing");
        timer = new CountdownTimer(ROUND_DURATION, () => {
          console.log("MEME TIME OVER");
        });
        timer.start();
        const interval = setInterval(() => {
          io.in(`round:${roundNo}`)
            .in("admin")
            .emit("setRemainingTime", timer.getRemainingTime());
          if (timer.hasStopped()) clearInterval(interval);
        }, 1000);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
