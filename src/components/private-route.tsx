import {Navigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {me} from "@/services/userService.ts";

type PrivateRouteProps = {
    children: React.ReactNode;
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const user = await me(token);
            setIsAuthenticated(user?.isActive);
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div>Carregando...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/" />;
};
