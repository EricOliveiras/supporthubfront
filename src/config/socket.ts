import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL;
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
