import apiClient from "@/api/apiClient.ts";

export type Sector = {
    id: number;
    name: string;
}

export const findAllSectors = async (token: string): Promise<Sector[]> => {
    try {
        const response = await apiClient.get<Sector[]>('/sectors', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // @ts-ignore
        return response.data.sectors
    } catch (error) {
        console.error("Erro ao buscar todos os setores:", error);
        throw error;
    }
}