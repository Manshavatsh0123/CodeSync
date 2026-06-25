import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();
app.use(express.static("public"))
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Yjs + Socket.IO setup
const ysocket = new YSocketIO(io);
ysocket.initialize();

// Home Route
// app.get("/", (req, res) => {
//     res.status(200).json({
//         message: "Hello World",
//         success: true,
//     });
// });

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "OK",
        success: true,
    });
});

// Start Server
const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

