import {useState} from "react";
import {Card, CardHeader, CardFooter, CardContent} from "@/components/ui/card";
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog";
import {assignTicket, updateTicket} from "@/services/ticketService.ts";
import {useToast} from "@/hooks/use-toast";

type TicketCardProps = {
    id: number;
    requester: string;
    problemDescription: string;
    finished: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    Sector: {
        name: string;
    };
    assignedTo?: {
        id: number;
        fullName: string;
    };
    loggedInUserId: number;
    isAdmin: boolean;
    onTicketUpdated: () => void;
};

export function TicketCard({
                               id,
                               requester,
                               problemDescription,
                               finished,
                               notes,
                               createdAt,
                               updatedAt,
                               assignedTo,
                               Sector,
                               loggedInUserId,
                               isAdmin,
                               onTicketUpdated,
                           }: TicketCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [solutionNotes, setSolutionNotes] = useState("");
    const {toast} = useToast();

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
            await assignTicket(id, token);
            closeModal();
            toast({
                title: "Você atenderá o ticket selecionado.",
                description: `O ticket #${id} será atendido por você.`,
            });
            onTicketUpdated();
        } catch (error) {
            console.error("Erro ao atribuir responsável:", error);
            toast({
                title: "Erro ao atender ticket!",
                description: "Houve um problema ao tentar atender o ticket. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const finalizeTicket = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                title: "Erro de autenticação",
                description: "Token não encontrado. Você precisa estar logado.",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateTicket(id, {finished: true, notes: solutionNotes}, token);
            closeModal();
            toast({
                title: "Ticket finalizado com sucesso!",
                description: `O ticket #${id} foi finalizado.`,
            });
            onTicketUpdated();
        } catch (error) {
            console.error("Erro ao finalizar ticket:", error);
            toast({
                title: "Erro ao finalizar ticket",
                description: "Houve um problema ao tentar finalizar o ticket. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const getStatusTagColor = () => {
        if (finished) {
            return "bg-gray-500";
        } else if (assignedTo) {
            return "bg-yellow-500";
        } else {
            return "bg-green-500";
        }
    };

    return (
        <>
            <Card
                className={`w-96 shadow-lg rounded-lg hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer mr-3.5 mt-3.5`}
                onClick={openModal}
            >
                <CardHeader className="flex flex-row justify-between items-center">
                    <h3 className="text-xl font-semibold">{problemDescription}</h3>
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
                    <DialogTitle id="ticket-details">Detalhes do chamado:</DialogTitle>
                    <DialogDescription id="ticket-description">
                        <p className="text-sm text-gray-700">
                            <strong>Solicitante:</strong> {requester}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Setor:</strong> {Sector?.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Descrição:</strong> {problemDescription}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Responsável:</strong> {assignedTo ? assignedTo.fullName : "Não atribuído"}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Solução:</strong> {notes ? notes : "Sem anotações."}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            <strong>Data/Hora do chamado:</strong> {new Date(createdAt).toLocaleString()}
                        </p>
                        {finished && (
                            <p className="text-sm text-gray-500 mt-2">
                                <strong>Finalizado em:</strong> {new Date(updatedAt).toLocaleString()}
                            </p>
                        )}

                        {isAdmin && !assignedTo && (
                            <div className="mt-4">
                                <button
                                    onClick={assignResponsible}
                                    className="mt-2 bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-500"
                                >
                                    Atender chamado
                                </button>
                            </div>
                        )}

                        {assignedTo?.id === loggedInUserId && !finished && (
                            <div className="mt-4">
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded mb-2"
                                    placeholder="Descreva a solução do problema"
                                    value={solutionNotes}
                                    onChange={(e) => setSolutionNotes(e.target.value)}
                                />
                                <button
                                    onClick={finalizeTicket}
                                    className="mt-2 bg-red-600 text-white rounded px-4 py-2 hover:bg-red-500"
                                >
                                    Finalizar chamado
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
