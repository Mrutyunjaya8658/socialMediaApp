import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

// 👇 Corrected this line:
const io = new Server(server, {
    cors: {
        origin: process.env.URL,
        methods: ['GET', 'POST'],
    },
});

const userSocketMap = {};

// Corrected: Use square brackets to access object properties
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: UserId= ${userId}, socketId: ${socket.id}`);
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        if (userId) {
            console.log(`User disconnected: UserId= ${userId}, socketId: ${socket.id}`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, server, io };
