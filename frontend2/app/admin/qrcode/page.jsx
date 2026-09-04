"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/Navbar";
import Loading from "@/components/Loading/Loading";
import isProtected from "@/hooks/isProtected";
import apiUrl from "@/constants/apiUrl";

const SESSIONS = [
  {
    type: "lunch",
    title: "Lunch",
    emoji: "🍛",
  },
  {
    type: "snack",
    title: "Snack",
    emoji: "☕",
  },
];

function getAutomaticSession() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const lunchStart = 11 * 60;
  const lunchEnd = 14 * 60;

  const snackStart = 15 * 60 + 30;
  const snackEnd = 17 * 60;

  if (minutes >= lunchStart && minutes <= lunchEnd) {
    return "lunch";
  }

  if (minutes > lunchEnd && minutes < snackStart) {
    return "snack";
  }

  if (minutes >= snackStart && minutes <= snackEnd) {
    return "snack";
  }

  return "lunch";
}

function formatCountdown(milliseconds) {
  if (milliseconds <= 0) return "00:00:00";

  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getSessionState(session, now) {
  if (!session) return "loading";

  const startsAt = new Date(session.startsAt).getTime();
  const expiresAt = new Date(session.expiresAt).getTime();

  if (now < startsAt) {
    return "upcoming";
  }

  if (now <= expiresAt) {
    return "active";
  }

  return "expired";
}

function getStatusText(session, now) {
  if (!session) return "Loading...";

  const startsAt = new Date(session.startsAt).getTime();
  const expiresAt = new Date(session.expiresAt).getTime();

  if (now < startsAt) {
    return `Starts in ${formatCountdown(startsAt - now)}`;
  }

  if (now <= expiresAt) {
    return `Expires in ${formatCountdown(expiresAt - now)}`;
  }

  return "Session expired";
}

export default function AdminQrPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState({
    lunch: null,
    snack: null,
  });

  const [selectedType, setSelectedType] = useState(null);

  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const loadQrSessions = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem("adminToken") || "";

      const results = await Promise.all(
        SESSIONS.map(async (session) => {
          const response = await axios.get(
            `${apiUrl}/api/scan/admin/qr?type=${session.type}`,
            {
              headers: {
                "x-access-token": adminToken,
              },
            }
          );

          return {
            type: session.type,
            data: response.data,
          };
        })
      );

      const nextSessions = {
        lunch: null,
        snack: null,
      };

      results.forEach(({ type, data }) => {
        nextSessions[type] = data;
      });

      setSessions(nextSessions);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Unable to load meal QR codes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      const ok = await isProtected("admin");

      if (!ok) {
        router.replace("/admin/login");
        return;
      }

      await loadQrSessions();
    }

    initialize();
  }, [router, loadQrSessions]);

  // Live clock for countdown.
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Refresh session information periodically.
  useEffect(() => {
    const timer = setInterval(() => {
      loadQrSessions();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadQrSessions]);


  useEffect(() => {
    if (!selectedType) {
      setSelectedType(getAutomaticSession());
    }
  }, [selectedType]);

  if (loading || !selectedType) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50">
        <Loading />
      </main>
    );
  }

  const session = sessions[selectedType];

  function selectSession(type) {
    setSelectedType(type);
  }

  function download() {
    if (!session) return;

    const expiresAt = new Date(session.expiresAt).getTime();

    if (Date.now() > expiresAt) {
      toast.error("This QR session has expired.");
      return;
    }

    const link = document.createElement("a");
    link.href = session.dataUrl;
    link.download = `messet-${session.type}-qr.png`;
    link.click();
  }

  const state = getSessionState(session, now);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
            Canteen QR
          </p>

          <h1 className="mt-2 text-4xl font-black">
            meSSET Meal QR
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Display the QR code for the current meal session.
            The code automatically expires when the session ends.
          </p>
        </div>

        {/* Selection */}
        <div className="mx-auto mt-8 max-w-xl rounded-3xl bg-white p-4 shadow-sm">
  <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
    Select meal
  </p>

  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={() => selectSession("lunch")}
      className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
        selectedType === "lunch"
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      🍛 Lunch
    </button>

    <button
      onClick={() => selectSession("snack")}
      className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
        selectedType === "snack"
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      ☕ Snack
    </button>
  </div>

  <p className="mt-3 text-center text-xs text-slate-500">
    Meal is automatically selected based on the current time.
  </p>
</div>
        {/* QR Card */}
        {!session ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-red-500">
              Unable to load the QR session.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
              {session.type === "lunch"
                ? "Lunch Session"
                : "Snack Session"}
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {session.type === "lunch"
                ? "🍛 Lunch QR"
                : "☕ Snack QR"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {session.label}
            </p>

            {/* QR */}
            {state === "expired" ? (
  <div className="mx-auto mt-8 flex h-80 w-80 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
    <div className="text-4xl">🔒</div>

    <p className="mt-4 text-lg font-black text-slate-700">
      QR unavailable
    </p>

    <p className="mt-2 max-w-xs text-center text-sm text-slate-500">
      This meal session has ended. The QR code is no longer available for
      display.
    </p>
  </div>
) : (
  <div className="mx-auto mt-8 w-fit rounded-2xl border bg-white p-4 shadow-sm">
    <img
      src={session.dataUrl}
      alt={`${session.type} meSSET QR code`}
      className="h-80 w-80"
    />
  </div>
)}

            {/* Status */}
            <div className="mt-7">
              {state === "active" && (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2 text-sm font-bold text-green-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    ACTIVE
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-800">
                    {getStatusText(session, now)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Keep this QR displayed until the meal session ends.
                  </p>
                </>
              )}

              {state === "upcoming" && (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2 text-sm font-bold text-amber-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    UPCOMING
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-800">
                    {getStatusText(session, now)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    This QR will become active when the meal window begins.
                  </p>
                </>
              )}

              {state === "expired" && (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-2 text-sm font-bold text-red-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    EXPIRED
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    This meal session has ended.
                  </p>
                </>
              )}
            </div>

            {/* Download */}
            <Button
              className="mt-7"
              onClick={download}
              disabled={state === "expired"}
            >
              Download{" "}
              {session.type === "lunch"
                ? "Lunch"
                : "Snack"}{" "}
              QR
            </Button>

            {/* Session information */}
            <div className="mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                Valid from{" "}
                <strong>
                  {new Date(
                    session.startsAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>{" "}
                to{" "}
                <strong>
                  {new Date(
                    session.expiresAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>

              <p className="mt-1">
                Session date: {session.scanDay}
              </p>
            </div>
          </div>
        )}

        {/* Security notice */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center text-sm text-indigo-800">
          <strong>Secure session QR:</strong> Each meal has a unique
          QR token that becomes invalid after its meal window ends.
        </div>
      </div>
    </main>
  );
}