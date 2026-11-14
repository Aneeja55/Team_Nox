 "use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiUrl from "@/constants/apiUrl";
import isProtected from "@/hooks/isProtected";

const MEALS = {
  lunch: { label: "Lunch", emoji: "🍛", window: "11:00 AM – 2:00 PM" },
  snack: { label: "Snacks", emoji: "☕", window: "3:30 PM – 5:00 PM" },
};


function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function MealCalendar({ scans }) {
  const [month, setMonth] = useState(() => new Date());

  const byDay = scans.reduce((acc, scan) => {
    const key = scan.scanDay;
    if (!acc[key]) acc[key] = [];
    acc[key].push(scan);
    return acc;
  }, {});

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const cells = Array.from({ length: leading + daysInMonth }, (_, i) =>
    i < leading ? null : i - leading + 1
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Meal calendar</CardTitle>
          <p className="text-sm text-slate-500">Green = lunch · Brown = snacks · Red = duplicate attempt</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>‹</Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>›</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-center font-semibold">
          {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(month)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="min-h-16 rounded-lg bg-slate-50" />;
            const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayScans = byDay[key] || [];
            const duplicate = dayScans.some((scan) => scan.status === "duplicate");
            const lunch = dayScans.some((scan) => scan.type === "lunch" && scan.status === "success");
            const snack = dayScans.some((scan) => scan.type === "snack" && scan.status === "success");

            return (
              <div key={key} className={`min-h-16 rounded-lg border p-1.5 ${duplicate ? "border-red-300 bg-red-50" : "border-slate-100 bg-white"}`}>
                <span className="text-sm font-semibold text-slate-700">{day}</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lunch && <span title="Lunch" className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                  {snack && <span title="Snacks" className="h-2.5 w-2.5 rounded-full bg-amber-700" />}
                  {duplicate && <span title="Duplicate scan attempt" className="h-2.5 w-2.5 rounded-full bg-red-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function playScanSound(type) {
  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    if (type === "success") {
      // Ascending confirmation sound
      oscillator.frequency.setValueAtTime(700, now);
      oscillator.frequency.setValueAtTime(1000, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } else {
      // Lower warning sound for duplicate scans
      oscillator.frequency.setValueAtTime(450, now);
      oscillator.frequency.setValueAtTime(300, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      oscillator.start(now);
      oscillator.stop(now + 0.27);
    }

    oscillator.addEventListener("ended", () => {
      context.close().catch(() => {});
    });
  } catch (_error) {
    // Sound is optional; scanning should still work if audio fails.
  }
}

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const [selectedTab, setSelectedTab] = useState("lunch");
  const [availability, setAvailability] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const authConfig = useCallback(() => ({
    headers: { "x-access-token": localStorage.getItem("token") || "" },
  }), []);

  const loadData = useCallback(async () => {
    try {
      const config = authConfig();
      const profileRes = await axios.get(`${apiUrl}/api/users/me`, config);

if (profileRes.data.role === "admin") {
  router.replace("/admin/dashboard");
  return;
}

const [historyRes, availabilityRes] = await Promise.all([
  axios.get(`${apiUrl}/api/scan/history`, config),
  axios.get(
    `${apiUrl}/api/scan/availability?type=${selectedTab}`,
    config
  ),
]);

setProfile(profileRes.data);
setHistory(historyRes.data);
setAvailability(availabilityRes.data);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        toast.error(error.response?.data?.error || "Unable to load your meal card.");
      }
    } finally {
      setLoading(false);
    }
  }, [authConfig, router, selectedTab]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    isProtected().then((ok) => {
      if (!ok) router.replace("/login");
      else loadData();
    });
  }, [token, router, loadData]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  async function stopCamera() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_error) {}
      scannerRef.current = null;
    }
    setCameraOpen(false);
  }

  async function startCamera() {
    if (processingRef.current || cameraOpen) return;

    try {
      processingRef.current = false;
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      setCameraOpen(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          await stopCamera();

          try {
            const response = await axios.post(
              `${apiUrl}/api/scan`,
              { type: selectedTab, code: decodedText },
              authConfig()
            );

            playScanSound("success");
            
            toast.success(response.data.message);

            router.push(
              `/scan/completed?type=${selectedTab}&success=1&time=${encodeURIComponent(
                response.data.time || ""
              )}`
            );
          } catch (error) {
            const duplicate = error.response?.data?.duplicate;
            const message = error.response?.data?.error || "Scan failed.";
            if (duplicate) {
              playScanSound("duplicate");
          }
            toast.error(message);
            await loadData();
          } finally {
            processingRef.current = false;
          }
        },
        () => {}
      );
    } catch (error) {
      console.error(error);
      await stopCamera();
      toast.error("Could not open the camera. Check camera permissions and use HTTPS.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  if (loading) {
    return <main className="min-h-screen grid place-items-center bg-slate-50"><p>Loading meSSET…</p></main>;
  }

  const meal = MEALS[selectedTab];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">meSSET</p>
            <h1 className="text-xl font-bold text-slate-900">Digital Mess Card</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{profile?.username}</span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
          <p className="text-sm text-indigo-100">Welcome back</p>
          <h2 className="mt-1 text-3xl font-black">{profile?.username}</h2>
          <p className="mt-2 text-indigo-100">Show the QR code at the canteen to record your meal.</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
  <Card className="border-0 shadow-sm">
    <CardContent className="p-6">
      <p className="text-sm font-medium text-slate-500">
        Total Mess Days
      </p>

      <p className="mt-1 text-sm text-slate-500">
        days eaten
      </p>
    </CardContent>
  </Card>

  <Card className="border-0 shadow-sm">
    <CardContent className="p-6">
      <p className="text-sm font-medium text-slate-500">
        Meal Records
      </p>

      <div className="mt-2 text-4xl font-black text-emerald-600">
        {history.filter((scan) => scan.status === "success").length}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        successful meals
      </p>
    </CardContent>
  </Card>
</div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{meal.emoji} {meal.label}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">{meal.window}</p>
                </div>
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {Object.entries(MEALS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTab(key)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold ${selectedTab === key ? "bg-white shadow-sm" : "text-slate-500"}`}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div id="reader" className={cameraOpen ? "mx-auto max-w-sm" : "hidden"} />
                {!cameraOpen && (
                  <>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-3xl">▦</div>
                    <h3 className="mt-4 text-lg font-bold">
                      {availability?.alreadyScanned ? `You've already had ${meal.label.toLowerCase()} today` :
                       availability?.withinWindow ? `Scan your ${meal.label.toLowerCase()} QR code` :
                       `${meal.label} scanning is closed`}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                      {availability?.alreadyScanned
                        ? "Your successful scan is already recorded for today."
                        : availability?.withinWindow
                          ? "Allow camera access and scan the QR displayed at the canteen."
                          : `Available only during ${meal.window}.`}
                    </p>
                    <Button
                      className="mt-6"
                      disabled={!availability?.withinWindow}
                      onClick={startCamera}
                    >
                      Open camera
                    </Button>
                  </>
                )}
                {cameraOpen && (
                  <Button variant="destructive" className="mt-4" onClick={stopCamera}>Stop camera</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>Recent meals</CardTitle></CardHeader>
            <CardContent>
              {history.filter((scan) => scan.status === "success").slice(0, 6).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between border-b py-3 last:border-0">
                  <div>
                    <p className="font-medium capitalize">{scan.type}</p>
                    <p className="text-xs text-slate-500">{formatDate(scan.date)}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">Recorded</span>
                </div>
              ))}
              {history.filter((scan) => scan.status === "success").length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No meals recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <MealCalendar scans={history} />
      </div>
    </main>
  );
}
