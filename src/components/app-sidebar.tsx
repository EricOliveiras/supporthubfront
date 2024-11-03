import { useEffect, useState } from "react";
import { LogOut, Home, User, Settings, ChartNoAxesCombined } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { me } from "@/services/userService";

export function AppSidebar() {
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                try {
                    const user = await me(token);
                    setIsAdmin(user.isAdmin);
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                }
            }
        };

        fetchUserData();
    }, [token]);

    // Menu items
    const items = [
        {
            title: "Painel",
            url: "/dashboard",
            icon: Home,
        },
        ...(isAdmin ? [{
            title: "Usuários",
            url: "/painel/usuarios",
            icon: User,
        }] : []),
        {
            title: "Configurações",
            url: "/configuracoes",
            icon: Settings,
        },
        ...(isAdmin ? [{
            title: "Estastiticas",
            url: "/stats",
            icon: ChartNoAxesCombined,
        }] : []),
        {
            title: "Sair",
            url: "/login",
            icon: LogOut,
            action: () => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        },
    ];

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>SupportHub</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        {item.action ? (
                                            <a href="#" onClick={item.action}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        ) : (
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
