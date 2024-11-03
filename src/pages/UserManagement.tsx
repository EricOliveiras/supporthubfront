import {useEffect, useState} from "react";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {findAllUsers} from "../services/userService.ts";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {UserCard} from "@/components/user-card.tsx";
import {UserSectorSelect} from "@/components/user-sector-select";
import {Sector} from "@/components/user-sector-select";
import {UserCreateModal} from "@/components/create-user-modal.tsx";
import {useToast} from "@/hooks/use-toast"; // Importando o hook useToast

const ITEMS_PER_PAGE = 12;

export const SECTORS: Sector[] = [
    {id: 0, name: "Todos"},
    {id: 1, name: "SEMAD-DAL"},
    {id: 2, name: "SEMAD-DTI"},
    {id: 3, name: "SEMAD-DGP"},
    {id: 4, name: "SEMAD-DSO"},
    {id: 5, name: "SEMAD-EGPA"},
    {id: 6, name: "SEMAD-GAB"},
    {id: 7, name: "SEMAD-NUCOM"},
    {id: 8, name: "SEMAD-NUJUR"},
    {id: 9, name: "SEMAD-SA"},
];

type User = {
    id: number;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    roleId: number;
    isActive: boolean;
    isAdmin: boolean;
    sectorId: number;
    Sector: {
        name: string;
    };
};

export function UserManagement() {
    const {toast} = useToast(); // Usando o hook useToast
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)) {
            setCurrentPage(page);
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token não encontrado.");
            return;
        }

        try {
            const allUsers = await findAllUsers(token);
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast({
                title: "Erro ao Buscar Usuários",
                description: "Houve um problema ao carregar a lista de usuários.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUserFilter = (selectedUsers: User[]) => {
        setFilteredUsers(selectedUsers);
        setCurrentPage(1);
    };

    const onUserCreated = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const allUsers = await findAllUsers(token);
            setUsers(allUsers);
            setFilteredUsers(allUsers);

            toast({
                title: "Usuário Criado!",
                description: "O novo usuário foi criado com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast({
                title: "Erro ao Atualizar Usuários",
                description: "Houve um problema ao atualizar a lista de usuários.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar/>
            <div className="flex h-screen w-screen">

                <div className="flex-1 p-4 w-full overflow-auto">
                    <div className="flex justify-between items-center mb-4 space-x-8">
                        <h2 className="text-2xl font-semibold">Gerenciamento de Usuários</h2>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Adicionar Novo Usuário
                        </button>
                    </div>

                    <UserSectorSelect
                        sectors={SECTORS}
                        users={users}
                        onSelectUsers={handleUserFilter}
                    />

                    <div className="flex-row flex flex-wrap mt-4">
                        {paginatedUsers.length === 0 ? (
                            <p className="text-gray-500">Nenhum usuário encontrado.</p>
                        ) : (
                            paginatedUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    id={user.id}
                                    fullName={user.fullName}
                                    email={user.email}
                                    isActive={user.isActive}
                                    isAdmin={user.isAdmin}
                                    Sector={{name: user.Sector ? user.Sector.name : "N/A"}}
                                    onUserUpdated={async () => {
                                        await fetchUsers();
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {filteredUsers.length > ITEMS_PER_PAGE && (
                        <Pagination className="mt-8">
                            <PaginationPrevious
                                className={`hover:cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            >
                                Anterior
                            </PaginationPrevious>
                            <PaginationContent className="hover:cursor-pointer">
                                {Array.from({length: Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}, (_, i) => (
                                    <PaginationItem key={i + 1}>
                                        <PaginationLink
                                            className={`py-2 px-4 rounded ${currentPage === i + 1 ? 'bg-slate-400 text-white' : 'bg-gray-200'}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                            <PaginationNext
                                className={`hover:cursor-pointer ${currentPage === Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => currentPage < Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) && handlePageChange(currentPage + 1)}
                            >
                                Próximo
                            </PaginationNext>
                        </Pagination>
                    )}

                    <UserCreateModal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onUserCreated={onUserCreated}
                    />
                </div>
            </div>
        </SidebarProvider>
    );
}
