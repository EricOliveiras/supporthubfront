import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { NotebookPen, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTORS } from "@/pages/UserManagement.tsx";
import { deleteUser, updateUser } from "@/services/userService.ts";
import { useToast } from "@/hooks/use-toast";

type UserCardProps = {
    id: number;
    fullName: string;
    email: string;
    isActive: boolean;
    isAdmin: boolean;
    Sector: {
        name: string;
    };
    onUserUpdated: () => void;
};

export function UserCard({
                             id,
                             fullName,
                             email,
                             isActive,
                             isAdmin,
                             Sector,
                             onUserUpdated
                         }: UserCardProps) {
    const { toast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({
        fullName,
        email,
        roleId: isAdmin ? 1 : 2,
        sectorId: Sector ? SECTORS.find(s => s.name === Sector.name)?.id || 0 : 0,
        isActive: isActive,
        password: "",
        confirmPassword: ""
    });

    const sectors = SECTORS;

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);

    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prevUser => ({ ...prevUser, [name]: value }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prevUser => ({ ...prevUser, [name]: parseInt(value, 10) }));
    };

    const handleDeleteUser = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await deleteUser(id, token);
            toast({
                title: "Usuário excluído com sucesso!",
                description: "O usuário foi removido da lista.",
                variant: "default",
            });
            onUserUpdated();
            closeDeleteModal();
        } catch (error) {
            console.error("Erro ao excluir o usuário:", error);
            toast({
                title: "Erro ao excluir o usuário",
                description: "Por favor, tente novamente mais tarde.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        if (user.password && user.password !== user.confirmPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...userWithoutId } = user;

            const userDataToUpdate = {
                ...userWithoutId,
                sectorId: user.sectorId,
                roleId: user.roleId
            };

            await updateUser(id, userDataToUpdate, token);
            toast({
                title: "Informações atualizadas com sucesso!",
                description: "O usuário foi atualizado com sucesso.",
                variant: "default",
            });
            onUserUpdated();
            closeEditModal();
        } catch (error) {
            console.error("Erro ao atualizar informações:", error);
            toast({
                title: "Erro ao atualizar informações",
                description: "Por favor, tente novamente mais tarde.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const handleIsActiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setUser(prevUser => ({ ...prevUser, isActive: value === "sim" }));
    };

    return (
        <>
            <Card className="w-96 shadow-lg rounded-lg mr-3.5 mt-3.5">
                <CardHeader className="flex flex-row justify-between">
                    <h3 className="text-xl font-semibold">{fullName}</h3>
                    <span className={`px-2 py-1 rounded text-white ${isActive ? "bg-green-500" : "bg-red-500"}`}>
                        {isActive ? "Ativo" : "Inativo"}
                    </span>
                </CardHeader>

                <CardContent className="space-y-2">
                    <p className="text-gray-700">Email: {email}</p>
                    <p className="text-gray-700">
                        {isAdmin ? (
                            <span className="px-2 text-xs font-medium bg-gray-200 text-gray-700 rounded">ADMIN</span>
                        ) : (
                            <span className="px-2 text-xs font-medium bg-gray-200 text-gray-700 rounded">PADRÃO</span>
                        )}
                    </p>
                    <p className="text-gray-700">
                        Setor: <span
                        className="px-2 text-xs font-medium bg-gray-200 text-gray-700 rounded">{Sector?.name}</span>
                    </p>
                </CardContent>
                <CardFooter className="flex space-x-4 justify-end">
                    <button onClick={openEditModal} className="text-gray-700 hover:text-gray-900">
                        <NotebookPen />
                    </button>
                    <button onClick={openDeleteModal} className="text-red-600 hover:text-red-800">
                        <Trash />
                    </button>
                </CardFooter>
            </Card>

            {/* Modal de Edição */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogTitle>Editar Usuário</DialogTitle>
                    <CardContent className="space-y-4">
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="roleId" className="text-right">Tipo de Usuário</Label>
                            <select
                                id="roleId"
                                name="roleId"
                                value={user.roleId}
                                onChange={handleSelectChange}
                                className="col-span-3 border border-gray-300 rounded p-2"
                            >
                                <option value={1}>Admin</option>
                                <option value={2}>Usuário Normal</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sectorId" className="text-right">Setor</Label>
                            <select
                                id="sectorId"
                                name="sectorId"
                                value={user.sectorId}
                                onChange={handleSelectChange}
                                className="col-span-3 border border-gray-300 rounded p-2"
                            >
                                <option value={0}>Selecione um Setor</option>
                                {sectors.map((sector) => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isActive" className="text-right">Ativo?</Label>
                            <select
                                id="isActive"
                                name="isActive"
                                value={user.isActive ? "sim" : "nao"}
                                disabled={user.isActive}
                                onChange={handleIsActiveChange}
                                className="col-span-3 border border-gray-300 rounded p-2"
                            >
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
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
                    <DialogFooter>
                        <button onClick={closeEditModal}
                                className="bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-600">
                            Cancelar
                        </button>
                        <button onClick={handleSave}
                                className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                                disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Exclusão */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogTitle>Confirmação de Exclusão</DialogTitle>
                    <DialogDescription>Tem certeza que deseja excluir este usuário?</DialogDescription>
                    <DialogFooter>
                        <button onClick={closeDeleteModal}
                                className="bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-600">
                            Cancelar
                        </button>
                        <button onClick={handleDeleteUser}
                                className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600">
                            Excluir
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
