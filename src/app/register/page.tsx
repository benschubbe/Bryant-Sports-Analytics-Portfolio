"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "lucide-react";

const classYearOptions = [
  { value: "2025", label: "Class of 2025" },
  { value: "2026", label: "Class of 2026" },
  { value: "2027", label: "Class of 2027" },
  { value: "2028", label: "Class of 2028" },
  { value: "2029", label: "Class of 2029" },
];

const concentrationOptions = [
  { value: "Data Science", label: "Data Science" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Management", label: "Management" },
  { value: "Information Systems", label: "Information Systems" },
  { value: "Other", label: "Other" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    classYear: "",
    concentration: "",
  });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          classYear: form.classYear || null,
          concentration: form.concentration || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created! Signing you in...");
      const signInResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    setError("");
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bryant-black px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-bryant-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />
          <h1 className="text-2xl font-bold text-white">
            Bryant Sports{" "}
            <span className="text-bryant-gold">Analytics Hub</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Create your account</p>
        </div>

        <Card className="border-bryant-gray-800 bg-bryant-gray-900">
          <CardContent className="py-8">
            {error && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                {success}
              </div>
            )}

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-bryant-gray-700 text-white hover:bg-bryant-gray-800"
                loading={oauthLoading === "github"}
                onClick={() => handleOAuth("github")}
              >
                <Code className="h-4 w-4" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-bryant-gray-700 text-white hover:bg-bryant-gray-800"
                loading={oauthLoading === "google"}
                onClick={() => handleOAuth("google")}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-bryant-gray-700" />
              <span className="text-xs text-bryant-gray-500">or sign up with email</span>
              <div className="h-px flex-1 bg-bryant-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" type="text" placeholder="Jane Doe" value={form.name} onChange={(e) => updateField("name", e.target.value)} required className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500" />
              <Input label="Email" type="email" placeholder="you@bryant.edu" value={form.email} onChange={(e) => updateField("email", e.target.value)} required className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500" />
              <Input label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => updateField("password", e.target.value)} required className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500" />
              <Input label="Confirm Password" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} required className="border-bryant-gray-700 bg-bryant-gray-800 text-white placeholder:text-bryant-gray-500" />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Class Year" options={classYearOptions} value={form.classYear} onChange={(e) => updateField("classYear", e.target.value)} className="border-bryant-gray-700 bg-bryant-gray-800 text-white" />
                <Select label="Concentration" options={concentrationOptions} value={form.concentration} onChange={(e) => updateField("concentration", e.target.value)} className="border-bryant-gray-700 bg-bryant-gray-800 text-white" />
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-bryant-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-bryant-gold transition-colors hover:text-bryant-gold-light">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
