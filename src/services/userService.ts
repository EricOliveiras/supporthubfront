import apiClient from '../api/apiClient';

export type UserRequest = {
    fullName: string;
    email: string;
    password: string;
    sectorId: number;
    isAdmin: boolean;
    isActive: boolean;
    roleId: number;
}

export type UserResponse = {
    user: {
        id: number;
        fullName: string;
        email: string;
        password: string;
        createdAt: string;
        updatedAt: string;
        roleId: number;
        isActive: boolean;
        sectorId: number;
        isAdmin: boolean;
        Sector: {
            id: number;
            name: string;
        };
        Ticket: Array<{
            id: number;
            requester: string;
            problemDescription: string;
            finished: boolean;
            createdAt: string;
            updatedAt: string;
            userId: number;
            sectorId: number;
        }>;
    };
    users: UserResponse['user'][];
};

export const me = async (token: string): Promise<UserResponse['user']> => {
    try {
        const response = await apiClient.get<UserResponse>('/users/profile/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.user;
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        throw error;
    }
};

export const create = async (data: UserRequest, token: string): Promise<UserResponse['user']> => {
    try {
        const response = await apiClient.post<UserResponse>('/users', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.user;
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        throw error;
    }
};

export const findAllUsers = async (token: string): Promise<UserResponse['users']> => {
    try {
        const response = await apiClient.get<UserResponse>('/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.users;
    } catch (error) {
        console.error("Erro ao buscar todos os usuários:", error);
        throw error;
    }
};

export const findUserById = async (id: number, token: string): Promise<UserResponse['user']> => {
    try {
        const response = await apiClient.get<UserResponse>(`/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.user;
    } catch (error) {
        console.error(`Erro ao buscar o usuário com ID ${id}:`, error);
        throw error;
    }
};

export const updateUser = async (id: number, data: UserRequest, token: string): Promise<UserResponse['user']> => {
    try {
        const response = await apiClient.put<UserResponse>(`/users/update/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.user;
    } catch (error) {
        console.error(`Erro ao atualizar o usuário com ID ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id: number, token: string): Promise<void> => {
    try {
        await apiClient.put<UserResponse>(`/users/delete/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(`Erro ao atualizar o usuário com ID ${id}:`, error);
        throw error;
    }
};


