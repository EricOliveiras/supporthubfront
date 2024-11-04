import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3333";
let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io(URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });
    }
    return socket;
};
