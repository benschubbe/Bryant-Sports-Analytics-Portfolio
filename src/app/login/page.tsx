"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        // Auto-match to clubs based on concentration
        fetch("/api/clubs/auto-match", { method: "POST" }).catch(() => {});
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl") || "/clubs";
        window.location.href = callbackUrl;
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />
        <h1 className="text-2xl font-bold text-white">
          Fol<span className="text-bryant-gold">io</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in to your account
        </p>
      </div>

      <Card className="border-bryant-gray-800 bg-bryant-gray-900">
        <CardContent className="py-8">
          {justRegistered && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Account created successfully! Sign in below.
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@bryant.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-bryant-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-bryant-gold transition-colors hover:text-bryant-gold-light"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bryant-black px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-bryant-gold/5 blur-3xl" />
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
