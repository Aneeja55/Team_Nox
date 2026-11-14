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
import { Input } from "@/components/ui/input";
import apiUrl from "@/constants/apiUrl";
import isProtected from "@/hooks/isProtected";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [previousMonth, setPreviousMonth] = useState(null);
  const [showPreviousMonth, setShowPreviousMonth] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const authConfig = useCallback(() => {
    return {
      headers: {
        "x-access-token":
          localStorage.getItem("adminToken") || "",
      },
    };
  }, []);

  /*
   * Load all students and their monthly days eaten.
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${apiUrl}/api/users`,
        authConfig()
      );

      const data = response.data;

      let studentList = [];

      if (Array.isArray(data)) {
        studentList = data;
      } else if (
        data &&
        Array.isArray(data.users)
      ) {
        studentList = data.users;
      }

      setUsers(studentList);

      setCurrentMonth(data?.currentMonth || null);
      setPreviousMonth(data?.previousMonth || null);
      setShowPreviousMonth(
        data?.showPreviousMonth === true
      );
    } catch (error) {
      console.error("Load students error:", error);

      if (
        [401, 403].includes(
          error.response?.status
        )
      ) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.error ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  }, [authConfig, router]);

  /*
   * Admin authentication.
   */
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    isProtected("admin").then((ok) => {
      if (!ok) {
        router.replace("/admin/login");
        return;
      }

      loadUsers();
    });
  }, [router, loadUsers]);

  /*
   * Create student.
   */
  async function createStudent(event) {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      toast.error("Username is required.");
      return;
    }

    if (!password || password.length < 4) {
      toast.error(
        "Password must be at least 4 characters."
      );
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        `${apiUrl}/api/users`,
        {
          username: cleanUsername,
          password,
        },
        authConfig()
      );

      toast.success("Student created successfully.");

      setUsername("");
      setPassword("");

      await loadUsers();
    } catch (error) {
      console.error(
        "Create student error:",
        error
      );

      if (
        [401, 403].includes(
          error.response?.status
        )
      ) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.error ||
          "Unable to create student."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Start editing a student.
   */
  function startEdit(user) {
    setEditingUser(user);
    setEditUsername(user.username || "");
    setEditPassword("");
  }

  /*
   * Cancel editing.
   */
  function cancelEdit() {
    setEditingUser(null);
    setEditUsername("");
    setEditPassword("");
  }

  /*
   * Update student.
   */
  async function updateStudent(event) {
    event.preventDefault();

    if (!editingUser) return;

    const cleanUsername = editUsername.trim();

    if (!cleanUsername) {
      toast.error("Username is required.");
      return;
    }

    const payload = {
      username: cleanUsername,
    };

    if (editPassword.trim()) {
      if (editPassword.length < 4) {
        toast.error(
          "Password must be at least 4 characters."
        );
        return;
      }

      payload.password = editPassword;
    }

    try {
      setSaving(true);

      await axios.put(
        `${apiUrl}/api/users/${editingUser._id || editingUser.id}`,
        payload,
        authConfig()
      );

      toast.success("Student updated successfully.");

      cancelEdit();
      await loadUsers();
    } catch (error) {
      console.error(
        "Update student error:",
        error
      );

      if (
        [401, 403].includes(
          error.response?.status
        )
      ) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.error ||
          "Unable to update student."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Delete student.
   */
  async function deleteStudent(user) {
    const confirmed = window.confirm(
      `Delete student "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await axios.delete(
        `${apiUrl}/api/users/${user._id || user.id}`,
        authConfig()
      );

      toast.success("Student deleted successfully.");

      await loadUsers();
    } catch (error) {
      console.error(
        "Delete student error:",
        error
      );

      if (
        [401, 403].includes(
          error.response?.status
        )
      ) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.error ||
          "Unable to delete student."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Logout.
   */
  function logout() {
    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Card>
            <CardContent className="py-12 text-center">
              Loading students...
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage students and view their monthly
              mess attendance.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/admin/dashboard")
              }
            >
              Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Create Student */}
        <Card>
          <CardHeader>
            <CardTitle>Add Student</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={createStudent}
              className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                placeholder="Username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Add Student"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Edit Student */}
        {editingUser && (
          <Card>
            <CardHeader>
              <CardTitle>
                Edit Student
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={updateStudent}
                className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]"
              >
                <Input
                  placeholder="Username"
                  value={editUsername}
                  onChange={(event) =>
                    setEditUsername(
                      event.target.value
                    )
                  }
                />

                <Input
                  type="password"
                  placeholder="New password (optional)"
                  value={editPassword}
                  onChange={(event) =>
                    setEditPassword(
                      event.target.value
                    )
                  }
                />

                <Button
                  type="submit"
                  disabled={saving}
                >
                  Save
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                All Students
              </CardTitle>

              <span className="text-sm text-slate-500">
                {users.length} student
                {users.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Username
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      {currentMonth?.label ||
                        "Current Month"}{" "}
                      Days
                    </th>

                    {showPreviousMonth && (
                      <th className="px-4 py-3 font-semibold">
                        {previousMonth?.label ||
                          "Previous Month"}{" "}
                        Days
                      </th>
                    )}

                    <th className="px-4 py-3 font-semibold">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          showPreviousMonth
                            ? 5
                            : 4
                        }
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={
                          user._id ||
                          user.id ||
                          user.username
                        }
                        className="border-t"
                      >
                        {/* Username */}
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {user.username}
                        </td>

                        {/* Current month */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-indigo-600">
                            {user.currentMonthDays ??
                              0}
                          </span>
                        </td>

                        {/* Previous month */}
                        {showPreviousMonth && (
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-600">
                              {user.previousMonthDays ??
                                0}
                            </span>
                          </td>
                        )}

                        {/* Created */}
                        <td className="px-4 py-3 text-slate-500">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                startEdit(
                                  user
                                )
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                deleteStudent(
                                  user
                                )
                              }
                              disabled={saving}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}