import apiClient from '../api/apiClient';

interface LoginResponse {
    token: string;
}

export const login = async (email: string, password: string) => {
    try {
        const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });

        const { token } = response.data;

        localStorage.setItem('token', token);

        return token;
    } catch {
        throw new Error('Erro ao fazer login. Verifique suas credenciais.');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};