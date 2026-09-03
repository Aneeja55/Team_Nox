 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CompletedPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setResult({
      success: params.get("success") === "1",
      type: params.get("type") || "meal",
      time: params.get("time") || "",
    });
  }, []);

  const label = result?.type === "snack" ? "Snacks" : "Lunch";

  return (
    <main className="min-h-screen grid place-items-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl ${result?.success ? "bg-emerald-100" : "bg-red-100"}`}>
          {result?.success ? "✓" : "!"}
        </div>
        <h1 className="mt-6 text-2xl font-black">
          {result?.success ? `${label} recorded!` : "Scan failed"}
        </h1>
        <p className="mt-2 text-slate-500">
          {result?.success
            ? `Your ${label.toLowerCase()} scan has been added to today's meal history.`
            : "Please return to the scanner and try again."}
        </p>
        {result?.time && <p className="mt-4 font-semibold text-slate-700">Recorded at {result.time}</p>}
        <Button className="mt-7 w-full" onClick={() => router.replace("/scan")}>
          Back to meal card
        </Button>
      </div>
    </main>
  );
}
