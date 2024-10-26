import {useState} from "react";
import {Card, CardHeader, CardFooter, CardContent} from "@/components/ui/card";
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog";
import {assignTicket, updateTicket, Ticket} from "@/services/ticketService.ts";

type TicketCardProps = {
    id: number;
    requester: string;
    problemDescription: string;
    finished: boolean;
    createdAt: string;
    updatedAt: string;
    Sector: {
        name: string;
    }
    assignedTo?: {
        id: number;
        fullName: string;
    };
    loggedInUserId: number; // ID do usuário logado
    isAdmin: boolean; // Nova prop para verificar se o usuário é admin
    onTicketUpdated: () => void;
};


export function TicketCard({
                               id,
                               requester,
                               problemDescription,
                               finished,
                               createdAt,
                               updatedAt,
                               assignedTo,
                               Sector,
                               loggedInUserId,
                               isAdmin,
                               onTicketUpdated,
                           }: TicketCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const assignResponsible = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const updatedTicket: Ticket = await assignTicket(id, token);
            console.log("Ticket atualizado:", updatedTicket);
            closeModal();
            alert("Responsável atribuído com sucesso!");
            onTicketUpdated();
        } catch (error) {
            console.error("Erro ao atribuir responsável:", error);
            alert("Houve um erro ao atribuir o responsável. Tente novamente.");
        }
    };

    const finalizeTicket = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token não encontrado. Você precisa estar logado.");
            return;
        }

        try {
            const ticket = await updateTicket(id, {finished: true}, token);
            console.log("Ticket finalizado:", ticket);
            closeModal();
            alert("Ticket finalizado com sucesso!");
            if (typeof onTicketUpdated === 'function') {
                onTicketUpdated();
            } else {
                console.error("onTicketUpdated não é uma função.");
            }
        } catch (error) {
            console.error("Erro ao finalizar ticket:", error);
            alert("Houve um erro ao finalizar o ticket. Tente novamente.");
        }
    };

    // Defina a cor da tag com base no status do ticket
    const getStatusTagColor = () => {
        if (finished) {
            return "bg-gray-500"; // Ticket finalizado (cinza)
        } else if (assignedTo) {
            return "bg-yellow-500"; // Ticket atribuído (amarelo)
        } else {
            return "bg-green-500"; // Ticket aberto (verde)
        }
    };

    return (
        <>
            <Card
                className={`w-80 shadow-lg rounded-lg hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer mr-3.5 mt-3.5`}
                onClick={openModal}
            >
                <CardHeader className="flex flex-row justify-between items-center">
                    <h3 className="text-xl font-semibold">Ticket #{id}</h3>
                    <span className={`px-2 py-1 rounded text-white ${getStatusTagColor()}`}>
                        {finished ? "Finalizado" : assignedTo ? "Em progresso" : "Aberto"}
                    </span>
                </CardHeader>

                <CardContent className="flex flex-row items-center space-x-2">
                    <p className="font-semibold">Setor:</p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                        {Sector?.name}
                    </span>
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-gray-500 mt-2">
                        <strong>Data/Hora do chamado:</strong><br/>
                        {new Date(createdAt).toLocaleString()}
                    </p>
                </CardFooter>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent aria-labelledby="ticket-details" aria-describedby="ticket-description">
                    <DialogTitle id="ticket-details">Ticket #{id} - Detalhes</DialogTitle>
                    <DialogDescription id="ticket-description">
                        <p className="text-sm text-gray-700">
                            <strong>Solicitante:</strong> {requester}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Descrição:</strong> {problemDescription}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Responsável:</strong> {assignedTo ? assignedTo.fullName : "Não atribuído"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            <strong>Data/Hora do chamado:</strong> {new Date(createdAt).toLocaleString()}
                        </p>
                        {finished && (
                            <p className="text-sm text-gray-500 mt-2">
                                <strong>Finalizado em:</strong> {new Date(updatedAt).toLocaleString()}
                            </p>
                        )}

                        {/* Mostrar botão Atribuir Responsável apenas se o usuário for admin */}
                        {isAdmin && !assignedTo && (
                            <div className="mt-4">
                                <button
                                    onClick={assignResponsible}
                                    className="mt-2 bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-500"
                                >
                                    Atribuir Responsável
                                </button>
                            </div>
                        )}

                        {/* Exibir botão de finalizar apenas se o usuário logado for o responsável */}
                        {assignedTo?.id === loggedInUserId && !finished && (
                            <div className="mt-4">
                                <button
                                    onClick={finalizeTicket}
                                    className="mt-2 bg-red-600 text-white rounded px-4 py-2 hover:bg-red-500"
                                >
                                    Finalizar Ticket
                                </button>
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter className="mt-6 flex justify-end">
                        <button
                            onClick={closeModal}
                            className="bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-600"
                        >
                            Fechar
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
