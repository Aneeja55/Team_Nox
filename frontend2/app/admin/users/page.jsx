 "use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar/Navbar";
import isProtected from "@/hooks/isProtected";
import apiUrl from "@/constants/apiUrl";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const config = () => ({ headers: { "x-access-token": localStorage.getItem("adminToken") || "" } });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users`, config());
      setUsers(response.data);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
      } else toast.error(error.response?.data?.error || "Failed to fetch students.");
    }
  }, [router]);

  useEffect(() => {
    isProtected("admin").then((ok) => {
      if (!ok) router.replace("/admin/login");
      else fetchUsers();
    });
  }, [fetchUsers, router]);

  function resetForm() {
    setEditing(null);
    setUsername("");
    setPassword("");
  }

  async function saveUser(event) {
    event.preventDefault();
    if (!username.trim() || (!editing && !password)) {
      toast.error(editing ? "Username is required." : "Username and password are required.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${apiUrl}/api/users/${editing._id}`, { username: username.trim(), password }, config());
        toast.success("Student updated.");
      } else {
        await axios.post(`${apiUrl}/api/users`, { username: username.trim(), password }, config());
        toast.success("Student created.");
      }
      resetForm();
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.username}? This also removes their meal history.`)) return;
    try {
      await axios.delete(`${apiUrl}/api/users/${user._id}`, config());
      toast.success("Student deleted.");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to delete student.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <p className="text-sm font-semibold text-indigo-600">ADMIN</p>
          <h1 className="text-3xl font-black">Student management</h1>
          <p className="mt-1 text-sm text-slate-500">Create, update and remove student accounts.</p>
        </div>

        <form onSubmit={saveUser} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <div><label className="text-sm font-medium">Username</label><Input className="mt-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Registration number" /></div>
            <div><label className="text-sm font-medium">Password {editing && <span className="font-normal text-slate-400">(leave blank to keep)</span>}</label><Input className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editing ? "New password" : "Password"} /></div>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Create"}</Button>
            {editing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-4">Username</th><th className="px-5 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-5 py-4 font-medium">{user.username}</td>
                  <td className="px-5 py-4 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(user); setUsername(user.username); setPassword(""); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(user)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan="3" className="px-5 py-10 text-center text-slate-500">No student accounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
