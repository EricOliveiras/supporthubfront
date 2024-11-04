import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createTicket } from "../services/ticketService";
import { Ticket } from "../services/ticketService.ts";
import { useToast } from "@/hooks/use-toast";
import { findAllTicketTypes } from "../services/ticketTypeService";
import { TicketType } from "../services/ticketTypeService";

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated: (ticket: Ticket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onTicketCreated,
                                                                    }) => {
    const { toast } = useToast();
    const [selectedProblem, setSelectedProblem] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [ticketTypeId, setTicketTypeId] = useState<number | null>(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchTicketTypes = async () => {
        try {
            const types = await findAllTicketTypes(token);
            setTicketTypes(types);
        } catch (error) {
            console.error("Erro ao buscar tipos de chamados:", error);
            toast({
                title: "Erro ao buscar tipos de chamado",
                description: "Não foi possível carregar os tipos de chamados.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchTicketTypes();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const descriptionToSubmit = selectedProblem === "Outros" ? customDescription : selectedProblem;

        try {
            if (ticketTypeId === null) {
                throw new Error("O ID do tipo de chamado não está definido.");
            }
            const newTicket = await createTicket(descriptionToSubmit, ticketTypeId, token);
            onTicketCreated(newTicket);
            toast({
                title: "Chamado criado com sucesso!",
                description: `O Chamado foi criado com a descrição: ${descriptionToSubmit}.`,
                variant: "default",
            });
            setSelectedProblem("");
            setCustomDescription("");
            setTicketTypeId(null);
            onClose();
        } catch (error) {
            console.error("Erro ao criar chamado:", error);
            toast({
                title: "Erro ao criar chamado",
                description: "Por favor, verifique os dados e tente novamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Chamado</DialogTitle>
                    <DialogDescription>
                        Selecione o assunto do problema que você gostaria de relatar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="problemSelect" className="text-right">
                            Assunto
                        </Label>
                        <select
                            id="problemSelect"
                            value={selectedProblem}
                            onChange={(e) => {
                                const selectedType = ticketTypes.find(type => type.name === e.target.value);
                                setSelectedProblem(e.target.value);
                                setTicketTypeId(selectedType ? selectedType.id : null);
                                if (e.target.value !== "Outros") {
                                    setCustomDescription("");
                                }
                            }}
                            className="col-span-3 border border-gray-300 rounded px-2 py-1"
                            required
                        >
                            <option value="" disabled>Selecione um assunto</option>
                            {ticketTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedProblem === "Outros" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customDescription" className="text-right">
                                Descrição Detalhada
                            </Label>
                            <textarea
                                id="customDescription"
                                value={customDescription}
                                onChange={(e) => setCustomDescription(e.target.value)}
                                className="col-span-3 border border-gray-300 rounded px-2 py-1"
                                rows={4}
                                required
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Criar Chamado</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
