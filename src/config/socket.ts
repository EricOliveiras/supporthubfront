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

        socket.on("connect", () => console.log("Conectado ao servidor Socket.IO:", socket?.id));
        socket.on("disconnect", () => console.log("Desconectado do servidor Socket.IO"));
        socket.on("reconnect_attempt", (attempt) => console.log(`Tentando reconectar, tentativa ${attempt}`));
        socket.on("reconnect", (attempt) => console.log(`Reconectado ao servidor na tentativa ${attempt}`));
        socket.on("reconnect_failed", () => console.log("Falha na reconexão"));
    }
    return socket;
};
