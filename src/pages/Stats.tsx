"use client"

import * as React from "react"
import {PieChart, Pie, Label, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectTrigger, SelectContent, SelectItem} from "@/components/ui/select"
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";

// Dados de exemplo
const periodos = ["Diário", "Semanal", "Mensal", "Bimestral", "Trimestral", "Semestral", "Anual"]
const setoresData = [
    {category: "Setor A", chamados: 275},
    {category: "Setor B", chamados: 200},
    {category: "Setor C", chamados: 287},
]
const tiposData = [
    {tipo: "Troca de Equipamento", chamados: 150},
    {tipo: "Problemas com Sistema", chamados: 180},
    {tipo: "Recuperação de Senha", chamados: 180},
    {tipo: "Outro", chamados: 120},
]

// Função principal
export function StatisticsPage() {
    const [selectedPeriodo, setSelectedPeriodo] = React.useState("Mensal")

    return (
        <SidebarProvider>
            <AppSidebar/>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 p-6 bg-white min-h-screen">
                <Card className="col-span-1 md:col-span-4">
                    <CardHeader>
                        <CardTitle>Período de Visualização</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={setSelectedPeriodo}>
                            <SelectTrigger className="w-full md:w-1/4">
                                <span>{selectedPeriodo}</span>
                            </SelectTrigger>
                            <SelectContent>
                                {periodos.map((periodo) => (
                                    <SelectItem key={periodo} value={periodo}>
                                        {periodo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Gráfico de Chamados por Setor */}
                <Card className="md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Chamados por Setor</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={setoresData}
                                dataKey="chamados"
                                nameKey="category"
                                innerRadius={80}
                                outerRadius={160}
                                fill="#8884d8"
                            >
                                <Label value="Chamados" position="center" />
                            </Pie>
                        </PieChart>
                    </CardContent>
                </Card>

                {/* Gráfico de Chamados por Tipo */}
                <Card className="md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Chamados por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <BarChart width={400} height={400} data={tiposData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tipo" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="chamados" fill="#82ca9d" />
                        </BarChart>
                    </CardContent>
                </Card>

                {/* Gráfico de Total de Chamados */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Total de Chamados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-4xl font-bold text-center">{setoresData.reduce((sum, item) => sum + item.chamados, 0)}</div>
                        <div className="text-center text-muted-foreground">Chamados totais no período selecionado</div>
                    </CardContent>
                </Card>
            </div>
        </SidebarProvider>
    )
}
