import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTicket } from "../services/ticketService"; // Ajuste o caminho conforme necessário
import { Ticket } from "../services/ticketService.ts"; // Ajuste o caminho de importação conforme necessário

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
    const [problemDescription, setProblemDescription] = useState("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newTicket = await createTicket(problemDescription, token);
            console.log(newTicket)
            onTicketCreated(newTicket); // Notifica o componente pai
            setProblemDescription(""); // Limpa o campo após a criação
            onClose(); // Fecha o modal
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Ticket</DialogTitle>
                    <DialogDescription>
                        Insira a descrição do problema que você gostaria de relatar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="problemDescription" className="text-right">
                            Descrição do Problema
                        </Label>
                        <Input
                            id="problemDescription"
                            value={problemDescription}
                            onChange={(e) => setProblemDescription(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
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
