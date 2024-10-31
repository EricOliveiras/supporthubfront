import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { me } from "../services/userService.ts";
import { findAllTickets, findTicketsByUserId } from "../services/ticketService.ts";
import { TicketCard } from "@/components/ticket-card.tsx";
import { CreateTicketModal } from "@/components/create-ticket-modal.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { connectSocket } from "@/config/socket.ts";
import { Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast"; // Importando o hook useToast

const ITEMS_PER_PAGE = 12;

type Ticket = {
    id: number;
    requester: string;
    problemDescription: string;
    finished: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
    sectorId: number;
    assignedTo?: {
        id: number;
        fullName: string;
    };
    Sector?: {
        name: string;
    };
};

type User = {
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
    Ticket: Ticket[];
};

type TicketsState = {
    openTickets: Ticket[];
    assignedTickets: Ticket[];
    closedTickets: Ticket[];
};

const getTickets = (tickets: Ticket[]): TicketsState => {
    const openTickets = tickets.filter(ticket => !ticket.finished && !ticket.assignedTo);
    const assignedTickets = tickets.filter(ticket => !ticket.finished && ticket.assignedTo);
    const closedTickets = tickets.filter(ticket => ticket.finished);

    return {
        openTickets,
        assignedTickets,
        closedTickets,
    };
};

let socket: Socket;

export function Dashboard() {
    const { toast } = useToast(); // Usando o hook useToast
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<TicketsState>({
        openTickets: [],
        assignedTickets: [],
        closedTickets: [],
    });
    const [activeTab, setActiveTab] = useState<'open' | 'progress' | 'closed'>('open');
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentTickets = tickets[`${activeTab === 'open' ? 'openTickets' : activeTab === 'progress' ? 'assignedTickets' : 'closedTickets'}`];
    const paginatedTickets = currentTickets.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= Math.ceil(currentTickets.length / ITEMS_PER_PAGE)) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!socket) {
            socket = connectSocket();
        }

        socket.on('ticketCreated', async (newTicket) => {
            setTickets(prevTickets => ({
                ...prevTickets,
                openTickets: [...prevTickets.openTickets, newTicket]
            }));
            toast({
                title: "Novo Ticket!",
                description: "Um novo ticket foi criado.",
                variant: "default",
            });
            await onTicketUpdated();
        });

        socket.on('ticketUpdated', async (updatedTicket) => {
            setTickets(prevTickets => {
                const updatedOpenTickets = prevTickets.openTickets.map(ticket =>
                    ticket.id === updatedTicket.id ? updatedTicket : ticket
                );

                // Verifica se o usuário logado é o dono do ticket
                if (updatedTicket.userId === loggedInUser?.id) {
                    let message;
                    if (updatedTicket.finished) {
                        message = `Seu ticket "${updatedTicket.problemDescription}" foi finalizado.`;
                    } else {
                        message = `Seu ticket "${updatedTicket.problemDescription}" foi atualizado.`;
                    }

                    toast({
                        title: updatedTicket.finished ? "Ticket Finalizado!" : "Ticket Atualizado!",
                        description: message,
                        variant: "default",
                    });
                }

                return {
                    ...prevTickets,
                    openTickets: updatedOpenTickets
                };
            });
            await onTicketUpdated();
        });

        socket.on('assignedTicket', async (assignedTicket) => {
            setTickets(prevTickets => {
                const openTickets = prevTickets.openTickets.filter(ticket => ticket.id !== assignedTicket.id);
                const assignedTickets = [...prevTickets.assignedTickets, assignedTicket];

                // Verifica se o usuário logado é o dono do ticket
                if (assignedTicket.userId === loggedInUser?.id) {
                    toast({
                        title: "Ticket Atribuído!",
                        description: `Seu ticket "${assignedTicket.problemDescription}" foi atribuído a alguém.`,
                        variant: "default",
                    });
                }

                return {
                    ...prevTickets,
                    openTickets,
                    assignedTickets
                };
            });
            await onTicketUpdated();
        });

        const fetchUserData = async () => {
            if (!token) return;

            try {
                const user = await me(token);
                setLoggedInUser(user);

                if (user) {
                    const allTickets = user.isAdmin ? await findAllTickets(token) : await findTicketsByUserId(token);
                    setTickets(getTickets(allTickets));
                    await onTicketUpdated();
                }
            } catch (error) {
                console.error("Erro ao buscar usuário logado:", error);
                toast({ // Adicionando toast de erro ao buscar usuário
                    title: "Erro ao Buscar Usuário",
                    description: "Houve um problema ao carregar suas informações.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        return () => {
            socket.off("ticketUpdated");
            socket.off("ticketCreated");
            socket.off("assignedTicket");
        };
    }, []);

    const onTicketUpdated = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const user = await me(token);
            setLoggedInUser(user);

            const updatedTickets = user.isAdmin ? await findAllTickets(token) : await findTicketsByUserId(token);
            setTickets(getTickets(updatedTickets));
        } catch (error) {
            console.error("Erro ao atualizar tickets:", error);
            toast({ // Adicionando toast de erro ao atualizar tickets
                title: "Erro ao Atualizar Tickets",
                description: "Houve um problema ao atualizar os tickets.",
                variant: "destructive",
            });
        }
    };

    const handleCreateNewTicket = () => {
        setModalOpen(true);
    };

    const handleTicketCreated = (newTicket: Ticket) => {
        setTickets(prevTickets => ({
            ...prevTickets,
            openTickets: [...prevTickets.openTickets, newTicket],
        }));
        toast({ // Adicionando toast de sucesso quando um ticket é criado
            title: "Ticket Criado!",
            description: "Seu novo ticket foi criado com sucesso.",
            variant: "default",
        });
    };

    const isAdmin = loggedInUser?.isAdmin;

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen">
                <AppSidebar/>

                <div className="flex-1 p-4 w-full overflow-auto">
                    <div className="flex justify-between items-center mb-4 space-x-8">
                        <h2 className="text-2xl font-semibold">Seja bem-vindo(a) {loggedInUser?.fullName}</h2>
                        {!isAdmin && (
                            <button
                                onClick={handleCreateNewTicket}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Criar Novo Ticket
                            </button>
                        )}
                        <CreateTicketModal
                            isOpen={isModalOpen}
                            onClose={() => setModalOpen(false)}
                            onTicketCreated={handleTicketCreated}
                        />
                    </div>

                    <div className="mt-4">
                        <div className="flex space-x-4 mb-4">
                            <button
                                onClick={() => setActiveTab('open')}
                                className={`py-2 px-4 rounded ${activeTab === 'open' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                            >
                                Tickets Abertos
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`py-2 px-4 rounded ${activeTab === 'progress' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                            >
                                Em Progresso
                            </button>
                            <button
                                onClick={() => setActiveTab('closed')}
                                className={`py-2 px-4 rounded ${activeTab === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
                            >
                                Finalizados
                            </button>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">
                                {activeTab === 'open' ? 'Tickets Abertos' : activeTab === 'progress' ? 'Tickets Em Progresso' : 'Tickets Finalizados'}
                            </h3>
                            <div className="flex-row flex flex-wrap">
                                {paginatedTickets.length === 0 ? (
                                    <p className="text-gray-500">Nenhum ticket encontrado.</p>
                                ) : (
                                    paginatedTickets.map((ticket, index) => (
                                        <TicketCard
                                            key={`${ticket.id}-${index}`}
                                            id={ticket.id}
                                            requester={ticket.requester}
                                            problemDescription={ticket.problemDescription}
                                            assignedTo={ticket.assignedTo}
                                            finished={ticket.finished}
                                            notes={ticket.notes}
                                            createdAt={ticket.createdAt}
                                            updatedAt={ticket.updatedAt}
                                            loggedInUserId={loggedInUser!.id}
                                            isAdmin={isAdmin as boolean}
                                            onTicketUpdated={onTicketUpdated}
                                            Sector={{name: ticket.Sector?.name ?? ""}}
                                        />
                                    ))
                                )}
                            </div>

                            {currentTickets.length >= 12 && ( // Condição para exibir a paginação
                                <Pagination className="mt-8">
                                    <PaginationPrevious
                                        className={`hover:cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}>
                                        Anterior
                                    </PaginationPrevious>
                                    <PaginationContent className="hover:cursor-pointer">
                                        {Array.from({length: Math.ceil(currentTickets.length / ITEMS_PER_PAGE)}, (_, i) => (
                                            <PaginationItem key={i + 1}>
                                                <PaginationLink
                                                    className={`py-2 px-4 rounded ${currentPage === i + 1 ? 'bg-slate-400 text-white' : 'bg-gray-200'}`}
                                                    onClick={() => handlePageChange(i + 1)}>{i + 1}</PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    </PaginationContent>
                                    <PaginationNext
                                        className={`hover:cursor-pointer ${currentPage === Math.ceil(currentTickets.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => currentPage < Math.ceil(currentTickets.length / ITEMS_PER_PAGE) && handlePageChange(currentPage + 1)}>
                                        Próximo
                                    </PaginationNext>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
