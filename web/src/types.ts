import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIoServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIoServer;
    };
  };
};

export const enum Role {
  "ADMIN" = "ADMIN",
  "PLAYER" = "PLAYER",
}

export type User = KindeUser & { role: Role };
