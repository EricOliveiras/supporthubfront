import apiClient from "@/api/apiClient.ts";
import { Ticket } from "@/services/ticketService.ts";

export type TicketType = {
    id: number;
    name: string;
};

export type TicketTypeResponse = {
    ticketType: TicketType;
};

export type TicketTypesResponse = {
    ticketTypes: TicketType[];
};

export type TotalTicketsResponse = {
    total: number;
};

export type TicketsByTypeResponse = {
    ticketsByType: { type: string; count: number }[];
};

export type TicketsBySectorResponse = {
    ticketsBySector: { sectorId: number; name: string; count: number }[]; // Atualize para incluir o nome do setor
};

// Função para buscar todos os tipos de tickets
export const findAllTicketTypes = async (token: string): Promise<TicketType[]> => {
    try {
        const response = await apiClient.get<TicketTypesResponse>('/ticket-types', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.ticketTypes;
    } catch (error) {
        console.error("Error fetching all ticket types:", error);
        throw error;
    }
};

// Função para criar um tipo de ticket
export const createTicketType = async (name: string, token: string): Promise<TicketType> => {
    try {
        const response = await apiClient.post<TicketTypeResponse>('/ticket-types',
            { name },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data.ticketType;
    } catch (error) {
        console.error("Error creating ticket type:", error);
        throw error;
    }
};

export const getTotalTickets = async (token: string): Promise<number> => {
    try {
        const response = await apiClient.get<TotalTicketsResponse>('/ticket-types/total', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data)
        return response.data.total;
    } catch (error) {
        console.error("Error fetching total tickets:", error);
        throw error;
    }
};

export const getTicketsByType = async (token: string): Promise<{ type: string; count: number }[]> => {
    try {
        const response = await apiClient.get<TicketsByTypeResponse>('/ticket-types/by-type', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.ticketsByType; // Retorna a estrutura correta
    } catch (error) {
        console.error("Error fetching tickets by type:", error);
        throw error;
    }
};

export const getTicketsBySector = async (token: string): Promise<{ sectorId: number; name: string; count: number }[]> => {
    try {
        const response = await apiClient.get<TicketsBySectorResponse>('/ticket-types/by-sector', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data.ticketsBySector; // Retorna a estrutura correta com nome do setor
    } catch (error) {
        console.error("Error fetching tickets by sector:", error);
        throw error;
    }
};

export const fetchTicketsByDateRange = async (startDate: string, endDate: string): Promise<Ticket[]> => {
    try {
        const response = await apiClient.post<Ticket[]>('/ticket-types/date-range', {
            startDate,
            endDate,
        });
        // @ts-ignore
        return response.data.tickets; // Ajuste conforme a estrutura do seu retorno
    } catch (error) {
        console.error("Error fetching tickets by date range:", error);
        throw error;
    }
};
