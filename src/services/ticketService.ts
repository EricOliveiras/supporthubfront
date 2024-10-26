import apiClient from "@/api/apiClient.ts";

export type Ticket = {
    id: number;
    requester: string;
    problemDescription: string;
    finished: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    sectorId: number;
    assignedToId?: number;
    user: {
        id: number;
        fullName: string;
    };
    sector: {
        id: number;
        name: string;
    };
    assignedTo?: {
        id: number;
        fullName: string;
    };
};

export type TicketResponse = {
    ticket: Ticket;
};

export type TicketsResponse = {
    tickets: Ticket[];
};

export const createTicket = async (problemDescription: string, token: string): Promise<Ticket> => {
    try {
        const response = await apiClient.post<TicketResponse>('/tickets',
            { problemDescription }, // Esta parte deve ser o corpo da requisição
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            } // Este objeto deve ser a configuração
        );
        return response.data.ticket;
    } catch (error) {
        console.error("Erro ao criar ticket:", error);
        throw error;
    }
};

export const findAllTickets = async (token: string): Promise<Ticket[]> => {
    try {
        const response = await apiClient.get<TicketsResponse>('/tickets', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.tickets;
    } catch (error) {
        console.error("Erro ao buscar todos os tickets:", error);
        throw error;
    }
};

export const findTicketsByUserId = async (token: string): Promise<Ticket[]> => {
    try {
        const response = await apiClient.get<TicketsResponse>('/tickets/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.tickets;
    } catch (error) {
        console.error("Erro ao buscar tickets do usuário:", error);
        throw error;
    }
};

export const findTicketById = async (id: number, token: string): Promise<Ticket> => {
    try {
        const response = await apiClient.get<TicketResponse>(`/tickets/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.ticket;
    } catch (error) {
        console.error("Erro ao buscar ticket por ID:", error);
        throw error;
    }
};

export const updateTicket = async (id: number, updatedData: Partial<Ticket>, token: string): Promise<Ticket> => {
    try {
        const response = await apiClient.put<TicketResponse>(`/tickets/update/${id}`, updatedData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.ticket;
    } catch (error) {
        console.error("Erro ao atualizar ticket:", error);
        throw error;
    }
};

export const assignTicket = async (id: number, token: string): Promise<Ticket> => {
    try {
        const response = await apiClient.put<TicketResponse>(
            `/tickets/update/assigned-ticket/${id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        return response.data.ticket;
    } catch (error) {
        console.error("Erro ao atribuir ticket:", error);
        throw error;
    }
};

export const deleteTicket = async (id: number, token: string): Promise<void> => {
    try {
        await apiClient.delete(`/tickets/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("Erro ao deletar ticket:", error);
        throw error;
    }
};
