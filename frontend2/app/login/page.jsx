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

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isProtected().then((protectedStatus) => {
      if (protectedStatus) router.replace("/scan");
    });
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username: username.trim(),
        password,
      });
      localStorage.setItem("token", response.data.token);
      toast.success("Welcome to meSSET!");
      router.replace("/scan");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Digital Mess Card</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">meSSET</h1>
          <p className="mt-3 text-slate-300">Your meal card, now on your phone.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900">Student Login</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to scan your meal QR code.</p>

          <div className="mt-7 space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                className="mt-2 h-11"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Registration number"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                className="mt-2 h-11"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/login")}
            className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-900"
          >
            Admin portal →
          </button>
        </form>
      </div>
    </main>
  );
}
