import { Server, Socket } from "socket.io";
import http from "http";
import express, { Application } from "express";

const app: Application = express();

const server = http.createServer(app);
const io:any = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId:string) => {
  return userSocketMap[receiverId];
};

const userSocketMap: { [userId: string]: string } = {}; // {userId: socketId}

io.on("connection", (socket:Socket) => {
  console.log("a user connected", socket.id);

  const userId: string | undefined = typeof socket.handshake.query.userId === 'string' ? socket.handshake.query.userId : undefined;
  if (userId !== undefined) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. Can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId !== undefined)
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
