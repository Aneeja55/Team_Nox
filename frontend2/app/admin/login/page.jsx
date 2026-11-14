 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import isProtected from "@/hooks/isProtected";
import apiUrl from "@/constants/apiUrl";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isProtected("admin").then((ok) => {
      if (ok) router.replace("/admin/dashboard");
    });
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Enter your admin credentials.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/admin/login`, {
        username: username.trim(),
        password,
      });
      localStorage.removeItem("token");
      localStorage.setItem("adminToken", response.data.token);
      router.replace("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">meSSET</p>
        <h1 className="mt-2 text-3xl font-black">Admin Portal</h1>
        <p className="mt-2 text-sm text-slate-500">Manage students and monitor today&apos;s meals.</p>
        <div className="mt-7 space-y-5">
          <div>
            <Label htmlFor="admin-username">Username</Label>
            <Input id="admin-username" className="mt-2" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        </div>
        <button type="button" className="mt-5 w-full text-sm text-slate-500 hover:text-slate-900" onClick={() => router.push("/login")}>
          ← Student login
        </button>
      </form>
    </main>
  );
}
