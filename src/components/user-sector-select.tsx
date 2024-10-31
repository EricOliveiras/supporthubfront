import * as React from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type Sector = {
    id: number;
    name: string;
};

type User = {
    id: number;
    fullName: string;
    email: string;
    sectorId: number;
};

// Props para o componente
type UserSectorSelectProps = {
    sectors: Sector[];
    users: User[];
    onSelectUsers: (selectedUsers: User[]) => void;
};

export function UserSectorSelect({
                                     sectors,
                                     users,
                                     onSelectUsers,
                                 }: UserSectorSelectProps) {
    // Estado para o setor selecionado
    const [selectedSector, setSelectedSector] = React.useState<string | null>(null);

    // Função para atualizar o setor selecionado e filtrar os usuários
    const handleSelectChange = (sectorId: string) => {
        setSelectedSector(sectorId);
        if (sectorId === "0") {
            // "0" representa "Todos" e deve retornar todos os usuários
            onSelectUsers(users);
        } else {
            const filteredUsers = users.filter(user => user.sectorId === Number(sectorId));
            onSelectUsers(filteredUsers);
        }
    };

    return (
        <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione um setor" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Setores</SelectLabel>
                    {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id.toString()}>
                            {sector.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
