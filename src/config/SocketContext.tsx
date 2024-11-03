import React, { createContext, useContext, useEffect, useState } from "react";
import { connectSocket } from "@/config/socket";
import { Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";

type SocketContextType = {
    socket: Socket | null;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toast } = useToast();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = connectSocket();
        setSocket(socketInstance);

        const showToast = (eventType: string, ticket: any) => {
            let title = "";
            let description = "";

            switch (eventType) {
                case "ticketCreated":
                    title = "Novo Ticket!";
                    description = `Ticket "${ticket.problemDescription}" foi criado.`;
                    break;
                case "ticketUpdated":
                    title = ticket.finished ? "Ticket Finalizado!" : "Ticket Atualizado!";
                    description = `Ticket "${ticket.problemDescription}" foi ${ticket.finished ? "finalizado" : "atualizado"}.`;
                    break;
                case "assignedTicket":
                    title = "Ticket Movido!";
                    description = `Seu ticket "${ticket.problemDescription}" foi movido para Em Progresso.`;
                    break;
            }

            toast({ title, description });
        };

        socketInstance.on("ticketCreated", (ticket) => showToast("ticketCreated", ticket));
        socketInstance.on("ticketUpdated", (ticket) => showToast("ticketUpdated", ticket));
        socketInstance.on("assignedTicket", (ticket) => showToast("assignedTicket", ticket));

        return () => {
            socketInstance.off("ticketCreated");
            socketInstance.off("ticketUpdated");
            socketInstance.off("assignedTicket");
        };
    }, [toast]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket deve ser usado dentro de um SocketProvider");
    }
    return context;
};
