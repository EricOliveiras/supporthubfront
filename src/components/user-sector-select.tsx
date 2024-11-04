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

export type User = {
    id: number;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    roleId: number;
    isActive: boolean;
    isAdmin: boolean;
    sectorId: number;
    Sector: {
        name: string;
    };
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
    const [, setSelectedSector] = React.useState<string | null>(null);

    const handleSelectChange = (sectorId: string) => {
        setSelectedSector(sectorId);
        if (sectorId === "0") {
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
