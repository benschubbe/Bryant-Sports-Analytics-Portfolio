import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  BarChart3,
  Layers,
  Calendar,
  Rocket,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Club Portals",
    description:
      "Each club gets a full-featured portal with its own dashboard, feed, projects, events, and member directory.",
    icon: Building2,
  },
  {
    title: "Cross-Club Dashboard",
    description:
      "See all your clubs, projects, and activity in one place. Switch between club portals seamlessly.",
    icon: BarChart3,
  },
  {
    title: "Project Showcases",
    description:
      "Publish and showcase your work. Get peer reviews, build your portfolio, and stand out to employers.",
    icon: Layers,
  },
  {
    title: "Event Management",
    description:
      "Plan speaker sessions, workshops, and meetups. Keep your club community engaged and growing.",
    icon: Calendar,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-bryant-black/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Bryant University Logo */}
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Bryant_University_seal.svg/1200px-Bryant_University_seal.svg.png"
              alt="Bryant University"
              className="h-9 w-9 rounded-full object-contain bg-white p-0.5"
            />
            <span className="text-lg font-bold text-white">
              Fol<span className="text-bryant-gold">io</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/clubs"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Explore Clubs
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] bg-[length:400%_400%]" />
        {/* Campus image strip */}
        <div className="absolute top-16 left-0 right-0 h-48 overflow-hidden opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-bg.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-transparent to-[#1a1a2e]" />
        </div>
        {/* Floating decorative blobs */}
        <div className="absolute left-[10%] top-[20%] h-72 w-72 animate-blob rounded-full bg-bryant-gold/15 blur-3xl" />
        <div className="absolute right-[15%] top-[40%] h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-[#6b2737]/15 blur-3xl" />
        <div className="absolute bottom-[20%] left-[30%] h-80 w-80 animate-blob animation-delay-4000 rounded-full bg-[#1b4332]/15 blur-3xl" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1a2e]/90" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center">
            {/* Gold accent bar */}
            <div className="mx-auto mb-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Folio{" "}
              <span className="bg-gradient-to-r from-bryant-gold to-bryant-gold-light bg-clip-text text-transparent">
                &mdash; One Platform for Every Club on Campus
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
              Create a portal for your club in minutes. Projects, events,
              networking, and more.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/clubs">
                <Button size="lg" className="min-w-[160px]">
                  <Rocket className="h-5 w-5" />
                  Explore Clubs
                </Button>
              </Link>
              <Link href="/clubs/register">
                <Button variant="outline" size="lg" className="min-w-[160px] border-white/20 text-white hover:bg-white/10">
                  Register Your Club
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Decorative gold accent line */}
            <div className="mx-auto mt-20 h-px w-full max-w-lg bg-gradient-to-r from-transparent via-bryant-gold/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-bryant-gray-900">
              Everything Your Club Needs
            </h2>
            <p className="mt-3 text-bryant-gray-500">
              A complete platform for campus organizations
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="py-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bryant-gold/10">
                      <Icon className="h-6 w-6 text-bryant-gold" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-bryant-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-bryant-gray-500">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-bryant-black to-bryant-gray-900 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Building2 className="mx-auto mb-6 h-12 w-12 text-bryant-gold" />
          <h2 className="text-3xl font-bold text-white">
            Ready to launch your club portal?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Join Folio and give your organization the platform it
            deserves.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/clubs/register">
              <Button size="lg">Register Your Club</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bryant-black px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="mb-3 h-1 w-8 rounded-full bg-bryant-gold" />
              <h3 className="text-lg font-bold text-white">
                Fol<span className="text-bryant-gold">io</span>
              </h3>
              <p className="mt-2 text-sm text-white/40">
                One platform for every club on campus.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/clubs"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Explore Clubs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/clubs/register"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Register a Club
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-center text-xs text-white/30">
              &copy; {new Date().getFullYear()} Folio — Bryant University. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
