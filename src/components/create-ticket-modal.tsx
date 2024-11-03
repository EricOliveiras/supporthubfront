import {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {createTicket} from "../services/ticketService";
import {Ticket} from "../services/ticketService.ts";
import {useToast} from "@/hooks/use-toast";

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
    const {toast} = useToast();
    const [selectedProblem, setSelectedProblem] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const descriptionToSubmit = selectedProblem === "Outros" ? customDescription : selectedProblem; // Ajuste aqui

        try {
            const newTicket = await createTicket(descriptionToSubmit, token);
            onTicketCreated(newTicket);
            toast({
                title: "Ticket criado com sucesso!",
                description: `O ticket foi criado com a descrição: ${descriptionToSubmit}.`,
                variant: "default",
            });
            setSelectedProblem("");
            setCustomDescription("");
            onClose();
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            toast({
                title: "Erro ao criar ticket",
                description: "Por favor, verifique os dados e tente novamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Ticket</DialogTitle>
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
                                setSelectedProblem(e.target.value);
                                if (e.target.value !== "Outros") {
                                    setCustomDescription("");
                                }
                            }}
                            className="col-span-3 border border-gray-300 rounded px-2 py-1"
                            required
                        >
                            <option value="" disabled>Selecione um assunto</option>
                            <option value="Troca de equipamento">Troca de equipamento</option>
                            <option value="Problemas com acesso ao sistema">Problemas com acesso ao sistema</option>
                            <option value="Problemas de rede/internet">Problemas de rede/internet</option>
                            <option value="Erro em software">Erro em software</option>
                            <option value="Atualização de software">Atualização de software</option>
                            <option value="Falha no sistema">Falha no sistema</option>
                            <option value="Problemas com impressão">Problemas com impressão</option>
                            <option value="Outros">Outros</option>
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
                        <Button type="submit">Criar Ticket</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
