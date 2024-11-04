"use client";

import * as React from "react";
import {
    PieChart, Pie, Label, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, Cell, ResponsiveContainer
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {getTicketsBySector, getTicketsByType, getTotalTickets} from "@/services/ticketTypeService";

const COLORS = [
    "#FF8042", "#0088FE", "#00C49F", "#FFBB28", "#FF4444",
    "#A4DE02", "#D0ED57", "#a29bfe", "#fdcb6e", "#e17055"
];

function ChartContainer({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <Card className="col-span-1 w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center w-full">
                <ResponsiveContainer width="100%" height={400}>
                    {children}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function StatisticsPage() {
    const [sectorsData, setSectorsData] = React.useState<{ sectorId: number; count: number }[]>([]);
    const [typesData, setTypesData] = React.useState<{ type: string; count: number }[]>([]);
    const [totalTickets, setTotalTickets] = React.useState(0); // Exemplo de período inicial

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const total = await getTotalTickets(token);
            const sectors = await getTicketsBySector(token);
            const types = await getTicketsByType(token);

            setTotalTickets(total);
            setSectorsData(sectors);
            setTypesData(types);
        } catch (error) {
            console.error("Erro ao buscar estatísticas de chamados:", error);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <div className="flex-1 grid grid-cols-1 gap-6 p-6 bg-white min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <ChartContainer title="Chamados por Setor">
                        <PieChart>
                            <Pie
                                data={sectorsData}
                                dataKey="count"
                                nameKey="sectorId"
                                innerRadius={80}
                                outerRadius={160}
                                label={({name}) => `${name}`}
                            >
                                {sectorsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                                <Label value="Chamados" position="center"/>
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} Chamados`, `Setor: ${name}`]}/>
                        </PieChart>
                    </ChartContainer>

                    <ChartContainer title="Chamados por Tipo">
                        <BarChart data={typesData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="type"/>
                            <YAxis/>
                            <Tooltip/>
                            <Bar dataKey="count" fill={COLORS[0]}>
                                {typesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Total de Chamados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center">{totalTickets}</div>
                            <div className="text-center text-muted-foreground">Chamados
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SidebarProvider>
    );
}
