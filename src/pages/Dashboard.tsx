import {useEffect, useState} from "react";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {me} from "../services/userService.ts";
import {findAllTickets, findTicketsByUserId} from "../services/ticketService.ts";
import {TicketCard} from "@/components/ticket-card.tsx";
import {CreateTicketModal} from "@/components/create-ticket-modal.tsx";
import {connectSocket} from "@/config/socket.ts";
import {Socket} from "socket.io-client";

type Ticket = {
    id: number;
    requester: string;
    problemDescription: string;
    finished: boolean;
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
    }
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

// Função para organizar tickets por estado
const getTickets = (tickets: Ticket[]): TicketsState => {
    const openTickets = tickets.filter(ticket => !ticket.finished && !ticket.assignedTo);
    const assignedTickets = tickets.filter(ticket => !ticket.finished && ticket.assignedTo);
    const closedTickets = tickets.filter(ticket => ticket.finished);

    return {
        openTickets,
        assignedTickets,
        closedTickets
    };
};

let socket: Socket;

export function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<TicketsState>({openTickets: [], assignedTickets: [], closedTickets: []});
    const [activeTab, setActiveTab] = useState<'open' | 'progress' | 'closed'>('open');
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!socket) {
            socket = connectSocket();
        }

        socket.on('ticketUpdated', async (updatedTicket) => {
            setTickets(prevTickets => {
                const updatedOpenTickets = prevTickets.openTickets.map(ticket =>
                    ticket.id === updatedTicket.id ? updatedTicket : ticket
                );

                return {
                    ...prevTickets,
                    openTickets: updatedOpenTickets
                };
            });
            await onTicketUpdated();
        });

        socket.on('ticketCreated', async (newTicket) => {
            setTickets(prevTickets => ({
                ...prevTickets,
                openTickets: [...prevTickets.openTickets, newTicket]
            }));
            await onTicketUpdated();
        });

        socket.on('assignedTicket', async (assignedTicket) => {
            setTickets(prevTickets => {
                const openTickets = prevTickets.openTickets.filter(ticket => ticket.id !== assignedTicket.id);
                const assignedTickets = [...prevTickets.assignedTickets, assignedTicket];

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
                    // Carrega todos os tickets se o usuário for admin
                    const allTickets = user.isAdmin ? await findAllTickets(token) : await findTicketsByUserId(token);
                    console.log(allTickets)
                    setTickets(getTickets(allTickets));
                    await onTicketUpdated();
                }
            } catch (error) {
                console.error("Erro ao buscar usuário logado:", error);
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

    // Atualiza a lista de tickets
    const onTicketUpdated = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const updatedTickets = await findAllTickets(token);
            setTickets(getTickets(updatedTickets));
        } catch (error) {
            console.error("Erro ao atualizar tickets:", error);
        }
    };

    // Abre o modal para criar um novo ticket
    const handleCreateNewTicket = () => {
        setModalOpen(true);
    };

    // Atualiza a lista de tickets quando um novo ticket é criado
    const handleTicketCreated = (newTicket: Ticket) => {
        setTickets((prevTickets) => ({
            ...prevTickets,
            openTickets: [...prevTickets.openTickets, newTicket],
        }));
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

                        {activeTab === 'open' && (
                            <div>
                                <h3 className="text-lg font-semibold">Tickets Abertos</h3>
                                <div className="flex-row flex flex-wrap">
                                    {tickets.openTickets.length === 0 ? (
                                        <p className="text-gray-500">Nenhum ticket aberto.</p>
                                    ) : (
                                        tickets.openTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.id}
                                                id={ticket.id}
                                                requester={ticket.requester}
                                                problemDescription={ticket.problemDescription}
                                                assignedTo={ticket.assignedTo}
                                                finished={ticket.finished}
                                                createdAt={ticket.createdAt}
                                                updatedAt={ticket.updatedAt}
                                                onTicketUpdated={onTicketUpdated}
                                                loggedInUserId={loggedInUser!.id}
                                                isAdmin={isAdmin as boolean}
                                                Sector={{ name: ticket.Sector?.name ?? ""}}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'progress' && (
                            <div>
                                <h3 className="text-lg font-semibold">Tickets Em Progresso</h3>
                                <div className="flex-row flex flex-wrap">
                                    {tickets.assignedTickets.length === 0 ? (
                                        <p className="text-gray-500">Nenhum ticket em progresso.</p>
                                    ) : (
                                        tickets.assignedTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.id}
                                                id={ticket.id}
                                                requester={ticket.requester}
                                                problemDescription={ticket.problemDescription}
                                                assignedTo={ticket.assignedTo}
                                                finished={ticket.finished}
                                                createdAt={ticket.createdAt}
                                                updatedAt={ticket.updatedAt}
                                                onTicketUpdated={onTicketUpdated}
                                                loggedInUserId={loggedInUser!.id}
                                                isAdmin={isAdmin as boolean}
                                                Sector={{ name: ticket.Sector?.name ?? ""}}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'closed' && (
                            <div>
                                <h3 className="text-lg font-semibold">Tickets Finalizados</h3>
                                <div className="flex-row flex flex-wrap">
                                    {tickets.closedTickets.length === 0 ? (
                                        <p className="text-gray-500">Nenhum ticket finalizado.</p>
                                    ) : (
                                        tickets.closedTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.id}
                                                id={ticket.id}
                                                requester={ticket.requester}
                                                problemDescription={ticket.problemDescription}
                                                assignedTo={ticket.assignedTo}
                                                finished={ticket.finished}
                                                createdAt={ticket.createdAt}
                                                updatedAt={ticket.updatedAt}
                                                onTicketUpdated={onTicketUpdated}
                                                loggedInUserId={loggedInUser!.id}
                                                isAdmin={isAdmin as boolean}
                                                Sector={{ name: ticket.Sector?.name ?? ""}}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
