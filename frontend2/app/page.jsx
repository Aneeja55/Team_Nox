"use client";
import Loading from "@/components/Loading/Loading";
import isProtected from "@/hooks/isProtected";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const checkProtection = async () => {
      let protectedStatus = await isProtected();
      if (protectedStatus) {
        router.push('/scan');
      }else {
        router.push('/login');
      }
    };
    checkProtection();
  }, []);

  return (
    <Loading />
  );
}
