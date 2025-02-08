"use client"
import Navbar from "@/components/Navbar/Navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react"

// Dummy data
const lunchData = [
    { id: 1, name: "John Doe", time: "12:30 PM", date: "2024-02-09" },
    { id: 2, name: "Jane Smith", time: "12:45 PM", date: "2024-02-09" },
    { id: 3, name: "Bob Johnson", time: "1:00 PM", date: "2024-02-09" },
]

const snacksData = [
    { id: 1, name: "Alice Brown", time: "4:15 PM", date: "2024-02-09" },
    { id: 2, name: "Charlie Davis", time: "4:30 PM", date: "2024-02-09" },
    { id: 3, name: "Eva Wilson", time: "4:45 PM", date: "2024-02-09" },
]

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("lunch")

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Users</CardTitle>
                            <CardDescription>Active users today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{lunchData.length + snacksData.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lunch Count</CardTitle>
                            <CardDescription>Users had lunch today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{lunchData.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Snacks Count</CardTitle>
                            <CardDescription>Users had snacks today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{snacksData.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="lunch" className="bg-white p-6 rounded-lg shadow-sm">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger 
                            value="lunch"
                            onClick={() => setActiveTab("lunch")}
                        >
                            Lunch Details
                        </TabsTrigger>
                        <TabsTrigger 
                            value="snacks"
                            onClick={() => setActiveTab("snacks")}
                        >
                            Snacks Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lunch">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lunchData.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.time}</TableCell>
                                        <TableCell>{user.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="snacks">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {snacksData.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.time}</TableCell>
                                        <TableCell>{user.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}