import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3333";
let socket: Socket; // Permitir que socket seja null

export const connectSocket =  (): Socket => {
    if (!socket) {
        socket = io(URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity, // Tenta reconectar indefinidamente
            reconnectionDelay: 1000, // Espera 1 segundo entre tentativas
            reconnectionDelayMax: 5000, // Tempo máximo de espera de 5 segundos
            timeout: 20000 // Tempo limite de 20 segundos para conexão
        });

        socket.on("connect", () => {
            console.log("Conectado ao servidor Socket.IO:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Desconectado do servidor Socket.IO");
        });

        socket.on("reconnect_attempt", (attempt) => {
            console.log(`Tentando reconectar, tentativa ${attempt}`);
        });

        socket.on("reconnect", (attempt) => {
            console.log(`Reconectado ao servidor na tentativa ${attempt}`);
        });

        socket.on("reconnect_failed", () => {
            console.log("Falha na reconexão");
        });
    }
    return socket; // Retorna o socket, que pode ser null
};
