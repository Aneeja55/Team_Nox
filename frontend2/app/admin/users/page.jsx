"use client"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Navbar from "@/components/Navbar/Navbar"

// Dummy data
const initialUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
]

export default function UsersPage() {
    const [users, setUsers] = useState(initialUsers)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleEdit = (user) => {
        setSelectedUser(user)
        setIsOpen(true)
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Users</h1>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">Create User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedUser ? "Edit User" : "Create User"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            placeholder="Enter name"
                                            defaultValue={selectedUser?.name}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            placeholder="Enter email"
                                            defaultValue={selectedUser?.email}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Role</label>
                                        <Input
                                            placeholder="Enter role"
                                            defaultValue={selectedUser?.role}
                                        />
                                    </div>
                                    <Button className="w-full">
                                        {selectedUser ? "Update User" : "Create User"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    )
}