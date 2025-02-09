"use client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import apiUrl from "@/constants/apiUrl";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    // Fetch users from the API
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(apiUrl + "/api/users", {
                headers: { "x-access-token": token },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users.");
        }
    };

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

    useEffect(() => {
        validateProtectedRoute();
        fetchUsers();
    }, []);

    // Handle Create User
    const handleCreateUser = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.post(apiUrl+
                "/api/users",
                { username: username, password },
                { headers: { "x-access-token": token } }
            );
            setUsername("");
            setPassword("");
            setIsOpen(false);
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user.");
        }
    };

    // Handle Edit User
    const handleEditUser = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.put(apiUrl+
                `/api/users/${selectedUser._id}`,
                { username: username, password },
                { headers: { "x-access-token": token } }
            );
            setUsername("");
            setPassword("");
            setIsOpen(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Error editing user:", error);
            alert("Failed to edit user.");
        }
    };

    // Handle Delete User
    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(apiUrl+`/api/users/${userId}`, {
                headers: { "x-access-token": token },
            });
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Users</h1>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">
                                    {selectedUser ? "Edit User" : "Create User"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedUser ? "Edit User" : "Create User"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Username</label>
                                        <Input
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value || "")}
                                            defaultValue={selectedUser?.username}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            placeholder="Enter password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value || "")}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={
                                            selectedUser ? handleEditUser : handleCreateUser
                                        }
                                    >
                                        {selectedUser ? "Update User" : "Create User"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user, index) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setUsername(user.username);
                                                setPassword("");
                                                setIsOpen(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}