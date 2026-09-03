 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/Navbar";
import Loading from "@/components/Loading/Loading";
import isProtected from "@/hooks/isProtected";
import apiUrl from "@/constants/apiUrl";

export default function AdminQrPage() {
  const [qr, setQr] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const ok = await isProtected("admin");
      if (!ok) return router.replace("/admin/login");

      try {
        const response = await axios.get(`${apiUrl}/api/scan/admin/qr`, {
          headers: { "x-access-token": localStorage.getItem("adminToken") || "" },
        });
        setQr(response.data);
      } catch (error) {
        toast.error(error.response?.data?.error || "Unable to generate QR code.");
      }
    }
    load();
  }, [router]);

  if (!qr) return <main className="min-h-screen grid place-items-center bg-slate-50"><Loading /></main>;

  function download() {
    const link = document.createElement("a");
    link.href = qr.dataUrl;
    link.download = "messet-qr-code.png";
    link.click();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Canteen QR</p>
          <h1 className="mt-2 text-3xl font-black">meSSET Meal QR</h1>
          <p className="mt-2 text-sm text-slate-500">Display this code at the canteen. It is valid for both lunch and snacks.</p>
          <div className="mx-auto mt-8 w-fit rounded-2xl border bg-white p-4 shadow-sm">
            <img src={qr.dataUrl} alt="meSSET canteen QR code" className="h-80 w-80" />
          </div>
          <Button className="mt-7" onClick={download}>Download QR</Button>
        </div>
      </div>
    </main>
  );
}
