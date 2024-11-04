import { useState, useEffect } from "react";
import { me, updateUser } from "@/services/userService.ts";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState({
        id: 0,
        fullName: "",
        password: "",
        confirmPassword: "",
        email: "",
        roleId: 2,
        isAdmin: false,
        sectorId: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const userData = await me(token);
                setUser({
                    id: userData.id,
                    fullName: userData.fullName,
                    password: "",
                    confirmPassword: "",
                    email: userData.email,
                    isAdmin: userData.isAdmin,
                    roleId: userData.roleId,
                    sectorId: userData.sectorId,
                });
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                toast({
                    title: "Erro ao Carregar Dados",
                    description: "Houve um problema ao carregar suas informações.",
                    variant: "destructive",
                });
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        if (user.password && user.password !== user.confirmPassword) {
            alert("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, confirmPassword, ...userWithoutId } = user;

            const userDataToUpdate = {
                ...userWithoutId,
                sectorId: user.isAdmin ? user.sectorId : user.sectorId,
                roleId: user.isAdmin ? user.roleId : user.roleId
            };

            await updateUser(id, userDataToUpdate, token);
            toast({
                title: "Informações Atualizadas!",
                description: "Suas informações foram atualizadas com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error("Erro ao atualizar informações:", error);
            toast({
                title: "Erro ao Atualizar Informações",
                description: "Houve um problema ao atualizar suas informações.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    return (
        <SidebarProvider>
            <div className="flex">
                <AppSidebar />
                <div className="flex-1">
                    <div className="w-full mx-auto">
                        <CardHeader>
                            <h2 className="text-xl font-bold">Configurações da Conta</h2>
                            <p className="text-gray-500">Atualize suas informações pessoais</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Campo Nome Completo */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={user.fullName}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="col-span-3 bg-gray-100"
                                />
                            </div>

                            {/* Campo Nova Senha */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Nova Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={user.password}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>

                            {/* Campo Confirmar Nova Senha */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="confirmPassword" className="text-right">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={user.confirmPassword}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </CardFooter>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default SettingsPage;
