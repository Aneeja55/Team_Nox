"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import Navbar from "@/components/Navbar/Navbar";
import Loading from "@/components/Loading/Loading";
import isProtected from "@/hooks/isProtected";
import apiUrl from "@/constants/apiUrl";

export default function Dashboard() {
  const [data, setData] = useState(null);

  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
  try {
    const token = localStorage.getItem("adminToken");

    const config = {
      headers: {
        "x-access-token": token || "",
      },
    };

    const dashboardRes = await axios.get(
      `${apiUrl}/api/scan/admin/dashboard`,
      config
    );

    const dashboardData = dashboardRes.data;

    setData({
      ...dashboardData,
      lunchUsers: dashboardData.lunchUsers || [],
      snackUsers: dashboardData.snackUsers || [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    if ([401, 403].includes(error.response?.status)) {
      localStorage.removeItem("adminToken");
      router.replace("/admin/login");
    } else {
      toast.error(
        error.response?.data?.error ||
          "Failed to load dashboard."
      );
    }
  }
}, [router]);

  useEffect(() => {
    isProtected("admin").then((ok) => {
      if (!ok) {
        router.replace("/admin/login");
      } else {
        fetchDashboard();
      }
    });
  }, [fetchDashboard, router]);

  /*
   * Automatically refresh every 30 seconds.
   */
  useEffect(() => {
    const interval = setInterval(
      fetchDashboard,
      30000
    );

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (!data) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50">
        <Loading />
      </main>
    );
  }

  /*
   * Table rows
   */
  function rows(items) {
    if (!items.length) {
      return (
        <tr>
          <td
            colSpan="4"
            className="px-4 py-10 text-center text-slate-500"
          >
            No scans recorded today.
          </td>
        </tr>
      );
    }

    return items.map((user) => (
      <tr
        key={user.id || user._id || user.username}
        className="border-t"
      >
        {/* Student */}
        <td className="px-4 py-3 font-medium">
          {user.username}
        </td>


        {/* Today's scan time */}
        <td className="px-4 py-3 text-slate-500">
          {user.time}
        </td>

        {/* Today's scan date */}
        <td className="px-4 py-3 text-slate-500">
          {user.date}
        </td>
      </tr>
    ));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">

        {/* =========================
            HEADER
        ========================== */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              ADMIN DASHBOARD
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Today&apos;s overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {data.date} · {data.timezone}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={fetchDashboard}
          >
            Refresh
          </Button>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================== */}
        <div className="grid gap-4 md:grid-cols-3">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Students
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-black">
                {data.totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Lunch scans
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-black">
                {data.totalLunchScans}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Snack scans
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-black">
                {data.totalSnackScans}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* =========================
            MEAL ATTENDANCE
        ========================== */}
        <Card className="border-0 shadow-sm">

          <CardHeader>
            <CardTitle>
              Meal attendance
            </CardTitle>
          </CardHeader>

          <CardContent>

            <Tabs defaultValue="lunch">

              <TabsList className="grid w-full grid-cols-2">

                <TabsTrigger value="lunch">
                  Lunch · {data.totalLunchScans}
                </TabsTrigger>

                <TabsTrigger value="snack">
                  Snacks · {data.totalSnackScans}
                </TabsTrigger>

              </TabsList>

              {/* =========================
                  LUNCH
              ========================== */}
              <TabsContent value="lunch">

                <ScanTable
                  items={data.lunchUsers || []}
                  rows={rows}
                />

              </TabsContent>

              {/* =========================
                  SNACK
              ========================== */}
              <TabsContent value="snack">

                <ScanTable
                  items={data.snackUsers || []}
                  rows={rows}
                />

              </TabsContent>

            </Tabs>

          </CardContent>
        </Card>

      </div>
    </main>
  );
}

/* =====================================================
   SCAN TABLE
===================================================== */

function ScanTable({ items, rows }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border">

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50 text-xs uppercase text-slate-500">

          <tr>

            <th className="px-4 py-3">
              Student
            </th>

            <th className="px-4 py-3">
              Days Eaten
            </th>

            <th className="px-4 py-3">
              Time
            </th>

            <th className="px-4 py-3">
              Date
            </th>

          </tr>

        </thead>

        <tbody>
          {rows(items)}
        </tbody>

      </table>

    </div>
  );
}