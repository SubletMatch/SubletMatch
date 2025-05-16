"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${API_URL}/verification/verify-email?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Verification failed.");
        }
        setStatus("success");
        setMessage("Your email has been successfully verified! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Email</CardTitle>
          <CardDescription>
            {status === "verifying" && "Verifying your email..."}
            {status === "success" && "Email verified 🎉"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter>
          {status !== "verifying" && (
            <Link href="/signin" className="w-full">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
