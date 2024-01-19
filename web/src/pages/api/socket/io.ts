import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo, Role, User, UserWithMeme } from "@/types";
import { CountdownTimer } from "@/lib/countdown-timer";
import { shuffle } from "@/lib/utils";

export const config = {
  api: {
    bodyParse: false,
  },
};

const ROUND_DURATION = 10; // in seconds
let roundStarted = false;
let roundTopic = "";
let startMemeing = false;
let timer: CountdownTimer;
let roundPlayers: UserWithMeme[] = [];
let currentIndex = 0;
let startVotingRound = false;
let player1: UserWithMeme | null = null;
let player2: UserWithMeme | null = null;
let totalVotesCount = 0;

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

async function getUsersInRoom(io: ServerIO, roomName: string) {
  try {
    const sockets = await io.fetchSockets();
    const rooms = io.sockets.adapter.rooms.keys();
    const userSockets = [...rooms]
      .filter((room) => room.includes("user:"))
      .map((room) => {
        const userId = room.split(":")[1];
        return sockets.find((s) => s.data.user && s.data.user.id === userId)!;
      });

    const usersInRoom = userSockets
      .filter((userSocket) => userSocket.rooms.has(roomName))
      .map((userSocket) => userSocket.data.user);
    return usersInRoom;
  } catch (err) {
    console.log(err);
    return [];
  }
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

      socket.on("reset", async () => {
        console.log("[RESET]");
        roundStarted = false;
        // roundTopic = "";
        startMemeing = false;
        timer.stop();
        roundPlayers = [];
        currentIndex = 0;
        startVotingRound = false;
        player1 = null;
        player2 = null;
        totalVotesCount = 0;
        // io.emit("setNextRound", 1);
        const sockets = await io.fetchSockets();
        sockets.forEach((socket) => {
          const rooms = socket.rooms;
          rooms.forEach((room) => {
            if (room.includes("round")) {
              socket.leave(room);
            }
          });
          socket.join("round:1");
        });
        const users = await getUsers(io);
        io.emit("getUsers", users);
        io.emit("setTopic", "");
        io.emit("setStartRound", false);
        // io.emit("setStartMemeing",false);
        io.emit("setEndMemeing", true);
        io.emit("showNextMeme", null, null);
        io.emit("setNextRound", 1);
        io.in("admin").emit("setShowNextRoundPlayers", false);
        io.in("admin").emit("canStartVotingRound", false);
        io.in("admin").emit("canGoToNextMeme", false);
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
        // io.in(`round:${roundNo}`).in("admin").emit("setStartRound");
        io.emit("setStartRound");
      });

      socket.on("startMemeing", (roundNo, roundTime) => {
        startMemeing = true;
        io.in(`round:${roundNo}`).in("admin").emit("setStartMemeing");
        timer = new CountdownTimer(roundTime, () => {
          console.log("MEME TIME OVER");
        });
        timer.start();
        const interval = setInterval(() => {
          io.in(`round:${roundNo}`)
            .in("admin")
            .emit("setRemainingTime", timer.getRemainingTime());
          if (timer.hasStopped()) {
            clearInterval(interval);
            io.in(`round:${roundNo}`).in("admin").emit("setEndMemeing");
            io.in("admin").emit("canStartVotingRound", true);
            startMemeing = false;
          }
        }, 1000);
      });

      socket.on("startVotingRound", async (roundNo) => {
        const users: UserWithMeme[] = await getUsersInRoom(
          io,
          `round:${roundNo}`,
        );
        const players = users.filter((user) => user.role === Role.PLAYER);
        // roundPlayers = shuffle(players);
        roundPlayers = players;
        currentIndex = 0;
        startVotingRound = true;
        io.in("admin").emit("canGoToNextMeme", true);
      });

      socket.on("nextMeme", (roundNo) => {
        totalVotesCount = 0;
        if (currentIndex >= roundPlayers.length) {
          player1 = null;
          player2 = null;
          // io.in(`round:${roundNo}`)
          //   .in("admin")
          io.emit("showNextMeme", null, null);
          io.in("admin").emit("canGoToNextMeme", false);
          io.in("admin").emit("canStartVotingRound", false);
          io.in("admin").emit("setShowNextRoundPlayers", true);
          return;
        }

        player1 = roundPlayers[currentIndex];
        player2 = roundPlayers?.[currentIndex + 1] ?? null;
        // io.in(`round:${roundNo}`)
        // .in("admin")
        io.emit("showNextMeme", player1, player2);
        currentIndex += 2;
      });

      socket.on("submitMeme", (imageUrl: string, prompt: string, callback) => {
        socket.data.user.meme = { imageUrl, prompt };
        callback({ status: "ok", submitted: true });
      });

      socket.on("setNoOfUsersInRound", (callback) => {
        callback({ status: "ok", noOfUsersInRound: roundPlayers?.length ?? 0 });
      });

      socket.on("setUsersInRound", (callback) => {
        callback({ status: "ok", usersInRound: roundPlayers ?? [] });
      });

      socket.on("select", async (roundNo, player, isSelected) => {
        const sockets = await io.fetchSockets();
        const playerSockets = sockets.filter(
          (socket) => socket.data.user.id === player.id,
        );
        playerSockets.forEach(async (socket) => {
          socket.data.user.selected = isSelected;
          if (isSelected) socket.join(`round:${roundNo + 1}`);
          else socket.leave(`round:${roundNo + 1}`);
        });

        io.in("admin").emit("setSelect", player.id, isSelected);
      });

      socket.on("vote", (roundNo, player: UserWithMeme, callback) => {
        totalVotesCount++;
        // io.in(`round:${roundNo}`)
        //   .in("admin")
        io.emit("setVote", player.id, totalVotesCount);
        callback({ status: "ok", submitted: true });
      });

      socket.on("setNextRoundPlayers", async (nextRoundNo, callback) => {
        const nextRoundPlayers = await getUsersInRoom(
          io,
          `round:${nextRoundNo}`,
        );
        callback({ status: "ok", nextRoundPlayers });
      });

      socket.on("goToNextRound", async (roundNo: number) => {
        const sockets = await io.fetchSockets();
        sockets.forEach((socket) => {
          if (socket.rooms.has("admin")) {
            socket.join(`round:${roundNo}`);
          }
        });
        io.in("admin").emit("setShowNextRoundPlayers", false);
        io.in(`round:${roundNo}`)
          .in("admin")
          .emit("setNextRound", roundNo + 1);
        roundStarted = false;
        roundTopic = "";
        roundPlayers = [];
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
