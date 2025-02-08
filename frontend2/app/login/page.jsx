// pages/login.tsx
"use client";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import isProtected from '@/hooks/isProtected'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from 'axios'
import { toast } from "sonner"  
import apiUrl from "@/constants/apiUrl"

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  useEffect(() => {
    const checkProtection = async () => {
      let protectedStatus = await isProtected();
      if (protectedStatus) {
        router.push('/scan');
      }
    };
    checkProtection();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await axios.post(apiUrl + '/api/auth/login', {
      username,
      password
    });
    const token = response.data.token;
    if (token) {
      localStorage.setItem('token', token);
      router.push('/scan');
    } else {
      toast.error('Invalid username or password');
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
