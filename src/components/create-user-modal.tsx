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
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {create} from "@/services/userService"; // Ajuste o caminho conforme necessário
import {UserRequest} from "@/services/userService.ts"; // Ajuste o caminho de importação conforme necessário
import {useToast} from "@/hooks/use-toast"; // Importando o hook useToast

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: (user: UserRequest) => void; // Callback para atualizar a lista de usuários
}

const sectors = [
    {id: 1, name: "SEMAD-DAL"},
    {id: 2, name: "SEMAD-DDG"},
    {id: 3, name: "SEMAD-DTI"},
    {id: 4, name: "SEMAD-DGP"},
    {id: 5, name: "SEMAD-DSO"},
    {id: 6, name: "SEMAD-EGPA"},
    {id: 7, name: "SEMAD-GAB"},
    {id: 8, name: "SEMAD-NUCOM"},
    {id: 9, name: "SEMAD-NUCONT"},
    {id: 10, name: "SEMAD-NUJUR"},
    {id: 11, name: "SEMAD-NUPLAN"},
    {id: 12, name: "SEMAD-SA"},
];

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onUserCreated,
                                                                }) => {
    const {toast} = useToast();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState(2);
    const [sectorId, setSectorId] = useState(0);

    const token = localStorage.getItem("token");
    if (!token) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = {
            fullName,
            email,
            password,
            roleId,
            sectorId,
            isAdmin: roleId === 1, // Define isAdmin com base no roleId
        };

        try {
            const newUser = await create(userData, token);
            console.log(newUser);
            onUserCreated(newUser); // Notifica o componente pai
            toast({
                title: "Usuário criado com sucesso!",
                description: `O usuário ${newUser.fullName} foi criado.`,
                variant: "default",
            });
            setFullName(""); // Limpa o campo após a criação
            setEmail("");
            setPassword("");
            setRoleId(2); // Reseta para Usuário Normal
            setSectorId(0); // Reseta para valor padrão
            onClose(); // Fecha o modal
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            toast({
                title: "Erro ao criar usuário",
                description: "Por favor, verifique os dados e tente novamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Insira os detalhes do novo usuário.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">
                            Nome Completo
                        </Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Senha
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="roleId" className="text-right">
                            Tipo de Usuário
                        </Label>
                        <select
                            id="roleId"
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className="col-span-3 border border-gray-300 rounded p-2" // Adicionando borda
                        >
                            <option value={1}>Admin</option>
                            <option value={2}>Usuário Normal</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sectorId" className="text-right">
                            Setor
                        </Label>
                        <select
                            id="sectorId"
                            value={sectorId}
                            onChange={(e) => setSectorId(Number(e.target.value))}
                            className="col-span-3 border border-gray-300 rounded p-2" // Adicionando borda
                        >
                            <option value={0}>Selecione um Setor</option>
                            {sectors.map((sector) => (
                                <option key={sector.id} value={sector.id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Criar Usuário</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
