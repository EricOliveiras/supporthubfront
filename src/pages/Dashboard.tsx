import {useEffect, useState} from "react";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {me} from "../services/userService";
import {findAllTickets, findTicketsByUserId} from "../services/ticketService";
import {TicketCard} from "@/components/ticket-card";
import {CreateTicketModal} from "@/components/create-ticket-modal";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {useToast} from "@/hooks/use-toast";
import {useSocket} from "@/config/SocketContext.tsx";

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

export function Dashboard() {
    const {toast} = useToast();
    const {socket} = useSocket();
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

    // Número de tickets abertos
    const openTicketsCount = tickets.openTickets.length;

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= Math.ceil(currentTickets.length / ITEMS_PER_PAGE)) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
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
                toast({
                    title: "Erro ao Buscar Usuário",
                    description: "Houve um problema ao carregar suas informações.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleTicketCreated = async (newTicket: Ticket) => {
            setTickets((prevTickets) => ({
                ...prevTickets,
                openTickets: [...prevTickets.openTickets, newTicket],
            }));
            toast({
                title: "Novo Ticket!",
                description: `Ticket "${newTicket.problemDescription}" foi criado.`,
                variant: "default",
            });
            await onTicketUpdated();
        };

        socket.on("ticketCreated", handleTicketCreated);

        return () => {
            socket.off("ticketCreated", handleTicketCreated);
        };
    }, [socket, toast]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

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
            toast({
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
        onTicketUpdated();
    };

    const isAdmin = loggedInUser?.isAdmin;

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar/>
            <div className="flex h-screen w-screen">
                <div className="flex-1 p-4 w-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Seja bem-vindo(a) {loggedInUser?.fullName}</h2>
                        {!loggedInUser?.isAdmin && (
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

                    <div className="flex-grow mt-4">
                        <div className="flex space-x-4 mb-4">
                            <button
                                onClick={() => setActiveTab('open')}
                                className={`relative py-2 px-4 rounded ${activeTab === 'open' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                            >
                                Tickets Abertos
                                {openTicketsCount > 0 && loggedInUser?.isAdmin && (
                                    <span
                                        className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        {openTicketsCount}
                                    </span>
                                )}
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

                        <div className="flex flex-wrap">
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
                    </div>

                    <div className="mt-4">
                        {currentTickets.length > ITEMS_PER_PAGE && (
                            <Pagination className="flex justify-center">
                                <PaginationPrevious
                                    className={`cursor-pointer ${currentPage === 1 ? 'cursor-not-allowed text-gray-400' : ''}`}
                                    onClick={() => {
                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                    }}
                                >
                                    Anterior
                                </PaginationPrevious>
                                <PaginationContent>
                                    {Array.from(
                                        {length: Math.ceil(currentTickets.length / ITEMS_PER_PAGE)},
                                        (_, i) => (
                                            <PaginationItem key={i + 1}>
                                                <PaginationLink
                                                    className="cursor-pointer"
                                                    onClick={() => handlePageChange(i + 1)}
                                                    isActive={currentPage === i + 1}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                </PaginationContent>
                                <PaginationNext
                                    className={`cursor-pointer ${currentPage === Math.ceil(currentTickets.length / ITEMS_PER_PAGE) ? 'cursor-not-allowed text-gray-400' : ''}`}
                                    onClick={() => {
                                        if (currentPage < Math.ceil(currentTickets.length / ITEMS_PER_PAGE)) {
                                            handlePageChange(currentPage + 1);
                                        }
                                    }}
                                >
                                    Próximo
                                </PaginationNext>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
