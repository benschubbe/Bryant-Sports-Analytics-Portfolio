"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Building2,
  GraduationCap,
  Crown,
  ArrowLeft,
  ArrowRight,
  Users,
  Layers,
  Calendar,
  BarChart3,
  Sparkles,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const plans = [
  {
    name: "Club",
    price: "$9",
    period: "/month per club",
    description: "For individual clubs at any university",
    icon: Building2,
    color: "bryant-gray-500",
    features: [
      "1 club portal",
      "Up to 50 members",
      "Projects, feed, and events",
      "Job board with LinkedIn/Indeed links",
      "AI project recommendations",
      "Weekly PDF reports",
      "Member leaderboard",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "University",
    price: "$99",
    period: "/month",
    description: "For universities wanting a campus-wide platform",
    icon: GraduationCap,
    color: "bryant-gold",
    features: [
      "Unlimited clubs",
      "Unlimited members",
      "Everything in Club plan",
      "Campus-wide dashboard and feed",
      "Employer search portal",
      "Public student showcase",
      "Weekly campus PDF reports",
      "Custom branding and colors",
      "Admin dashboard for university staff",
      "Priority support",
    ],
    cta: "Contact Sales",
    popular: true,
  },
  {
    name: "Bryant",
    price: "Free",
    period: "forever",
    description: "For Bryant University — where Folio was born",
    icon: Crown,
    color: "bryant-gold",
    features: [
      "Everything in University plan",
      "Unlimited clubs and members",
      "Full employer matching AI",
      "All features included",
      "Built by Bryant students, for Bryant students",
      "Always free — no catch",
    ],
    cta: "You're Already Here",
    popular: false,
    isBryant: true,
  },
];

export default function PricingPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    universityName: "",
    contactName: "",
    email: "",
    role: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-bryant-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-bryant-gold" />
            <span className="text-lg font-bold text-bryant-black">
              Fol<span className="text-bryant-gold">io</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/clubs" className="text-sm font-medium text-bryant-gray-600 hover:text-bryant-gold transition-colors">
              Explore
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-bryant-gold" />
          <h1 className="text-4xl font-extrabold text-bryant-black sm:text-5xl">
            Bring Folio to{" "}
            <span className="text-bryant-gold">Your Campus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-bryant-gray-500">
            Give every club on your campus a professional portfolio platform.
            Help students showcase their work and connect with employers.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-bryant-gray-100 bg-bryant-gray-50 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4 text-center">
          {[
            { icon: Users, label: "Students", value: "180+" },
            { icon: Building2, label: "Active Clubs", value: "12" },
            { icon: Layers, label: "Projects Built", value: "50+" },
            { icon: Calendar, label: "Events Hosted", value: "25+" },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-bryant-gold" />
              <p className="text-2xl font-extrabold text-bryant-black">{stat.value}</p>
              <p className="text-sm text-bryant-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-bryant-black">Simple Pricing</h2>
            <p className="mt-2 text-bryant-gray-500">Choose the plan that fits your organization</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${
                    plan.popular ? "ring-2 ring-bryant-gold shadow-lg scale-105" : ""
                  } ${plan.isBryant ? "bg-gradient-to-b from-bryant-black to-bryant-gray-900" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 rounded-bl-xl bg-bryant-gold px-3 py-1 text-xs font-bold text-white">
                      MOST POPULAR
                    </div>
                  )}
                  <div className={`h-1.5 ${plan.popular ? "bg-bryant-gold" : plan.isBryant ? "bg-gradient-to-r from-bryant-gold to-bryant-gold-light" : "bg-bryant-gray-200"}`} />
                  <CardContent className="py-8">
                    <div className="mb-6">
                      <Icon className={`mb-3 h-8 w-8 ${plan.isBryant ? "text-bryant-gold" : "text-bryant-gray-500"}`} />
                      <h3 className={`text-xl font-bold ${plan.isBryant ? "text-white" : "text-bryant-black"}`}>
                        {plan.name}
                      </h3>
                      <p className={`mt-1 text-sm ${plan.isBryant ? "text-white/60" : "text-bryant-gray-500"}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className={`text-4xl font-extrabold ${plan.isBryant ? "text-bryant-gold" : "text-bryant-black"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.isBryant ? "text-white/40" : "text-bryant-gray-400"}`}>
                        {" "}{plan.period}
                      </span>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.isBryant ? "text-bryant-gold" : "text-green-500"}`} />
                          <span className={`text-sm ${plan.isBryant ? "text-white/80" : "text-bryant-gray-600"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.isBryant ? (
                      <Link href="/clubs">
                        <Button size="lg" className="w-full">
                          Explore Folio
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : plan.popular ? (
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => setShowForm(true)}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowForm(true)}
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Folio */}
      <section className="bg-bryant-gray-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-bryant-black">
            Why Universities Choose Folio
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              { icon: Sparkles, title: "AI-Powered", desc: "Smart project recommendations, employer matching, and weekly reports — all automated." },
              { icon: Shield, title: ".edu Verified", desc: "Only verified university emails can sign up. Your campus, your community." },
              { icon: BarChart3, title: "Engagement Tracking", desc: "Leaderboards, impact scores, and growth metrics keep students active." },
              { icon: Users, title: "Employer Portal", desc: "Recruiters describe roles in plain English and find matching students instantly." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bryant-gold/10">
                  <item.icon className="h-5 w-5 text-bryant-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-bryant-black">{item.title}</h3>
                  <p className="mt-1 text-sm text-bryant-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      {showForm && (
        <section className="px-6 py-20" id="contact">
          <div className="mx-auto max-w-xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-bryant-black">
              {submitted ? "Thanks! We'll be in touch." : "Get Folio for Your Campus"}
            </h2>

            {submitted ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <p className="text-bryant-gray-600">
                    We&apos;ve received your inquiry. Our team will reach out within 24 hours
                    to discuss bringing Folio to your university.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="University Name"
                      required
                      value={formData.universityName}
                      onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                      placeholder="e.g. Boston University"
                    />
                    <Input
                      label="Your Name"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Full name"
                    />
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@university.edu"
                    />
                    <Input
                      label="Your Role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Student Life Director, Club President"
                    />
                    <Textarea
                      label="Tell us about your campus"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How many clubs? What are you hoping Folio can do for your students?"
                      rows={4}
                    />
                    <Button type="submit" size="lg" className="w-full">
                      Submit Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-bryant-black px-6 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-bryant-gold" />
          <h3 className="text-lg font-bold text-white">
            Fol<span className="text-bryant-gold">io</span>
          </h3>
          <p className="mt-2 text-sm text-white/40">
            Built at Bryant University. Available everywhere.
          </p>
          <p className="mt-6 text-xs text-white/20">
            &copy; {new Date().getFullYear()} Folio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
