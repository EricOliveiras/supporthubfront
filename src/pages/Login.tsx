import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/spinner";
import { AlertDialogDemo } from "@/components/alert-dialog.tsx";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const token = await login(email, password);
            console.log("Usuário logado:", token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-6 text-center">SupportHub - Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="email" className="block text-sm font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu email"
                            required
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div className="mb-6">
                        <Label htmlFor="password" className="block text-sm font-medium">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="mt-1 block w-full"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Spinner /> : "Entrar"}
                    </Button>
                </form>
            </div>

            <AlertDialogDemo open={error} onClose={() => setError(false)} />
        </div>
    );
};
