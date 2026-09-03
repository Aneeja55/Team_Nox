import apiUrl from "@/constants/apiUrl";
import axios from "axios";

export default async function isProtected(role = "user") {
  if (typeof window === "undefined") return false;

  const key = role === "admin" ? "adminToken" : "token";
  const token = localStorage.getItem(key);
  if (!token) return false;

  try {
    const path = role === "admin"
      ? "/api/auth/admin/protected"
      : "/api/auth/user/protected";

    const response = await axios.get(`${apiUrl}${path}`, {
      headers: { "x-access-token": token },
    });

    return response.data?.success === true;
  } catch (_error) {
    localStorage.removeItem(key);
    return false;
  }
}
