"use client";
import Navbar from "@/components/Navbar/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import apiUrl from "@/constants/apiUrl";
import Loading from "@/components/Loading/Loading";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("lunch");
    const [dashboardData, setDashboardData] = useState(null);
    const router = useRouter();

    // Validate protected route
    const validateProtectedRoute = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(apiUrl+"/api/auth/admin/protected", {
                headers: { "x-access-token": token },
            });
            if (!response.data.success) {
              router.push("/login"); // Redirect to login if not authorized
            }
        } catch (error) {
            console.error("Error validating protected route:", error);
          router.push("/login");
        }
    };

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(apiUrl+"/api/scan/admin/dashboard", {
                headers: { "x-access-token": token },
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            alert("Failed to fetch dashboard data.");
        }
    };

    useEffect(() => {
        validateProtectedRoute();
        fetchDashboardData();
    }, []);

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    const { totalUsers, totalLunchScans, lunchUsers, totalSnackScans, snackUsers } =
        dashboardData;

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
                            <p className="text-4xl font-bold">{totalUsers}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lunch Count</CardTitle>
                            <CardDescription>Users had lunch today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{totalLunchScans}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Snacks Count</CardTitle>
                            <CardDescription>Users had snacks today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{totalSnackScans}</p>
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
                                {lunchUsers.map((user,index) => (
                                    <TableRow key={index}>
                                        <TableCell>{user.username}</TableCell>
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
                                {snackUsers.map((user,index) => (
                                    <TableRow key={index}>
                                        <TableCell>{user.username}</TableCell>
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
    );
}