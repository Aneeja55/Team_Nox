 "use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  }

  return (
    <nav className="border-b bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/admin/dashboard" className="font-black tracking-tight">meSSET <span className="font-normal text-slate-400">Admin</span></Link>
        <div className="flex items-center gap-1">
          <Link href="/admin/dashboard" className={`rounded-lg px-3 py-2 text-sm ${pathname === "/admin/dashboard" ? "bg-white/10" : "text-slate-300"}`}>Dashboard</Link>
          <Link href="/admin/qrcode" className={`rounded-lg px-3 py-2 text-sm ${pathname === "/admin/qrcode" ? "bg-white/10" : "text-slate-300"}`}>QR</Link>
          <Link href="/admin/users" className={`rounded-lg px-3 py-2 text-sm ${pathname === "/admin/users" ? "bg-white/10" : "text-slate-300"}`}>Students</Link>
          <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={logout}>Logout</Button>
        </div>
      </div>
    </nav>
  );
}
