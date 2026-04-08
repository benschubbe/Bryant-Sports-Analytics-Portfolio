import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  Hammer,
  Search,
  Eye,
  Building2,
  Briefcase,
  Layers,
  Calendar,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Join a Club",
    description:
      "Find your community. Sports analytics, finance, CS, marketing — 29 domains.",
    icon: Users,
  },
  {
    number: "02",
    title: "Build Projects",
    description:
      "Create real work. Dashboards, models, research — not just homework.",
    icon: Hammer,
  },
  {
    number: "03",
    title: "Get Discovered",
    description:
      "Employers search by skills. Your projects speak for themselves.",
    icon: Search,
  },
];

const featuredProjects = [
  {
    title: "NFL Draft Prediction Model",
    author: "Marcus Johnson",
    tools: ["Python", "scikit-learn", "Pandas", "Streamlit"],
    views: 1240,
  },
  {
    title: "Brand Sentiment Dashboard",
    author: "Sarah Chen",
    tools: ["Tableau", "SQL", "NLP", "Twitter API"],
    views: 890,
  },
  {
    title: "Algorithmic Trading Bot",
    author: "Daniel Kim",
    tools: ["Python", "NumPy", "Alpaca API", "PostgreSQL"],
    views: 1050,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-bryant-black backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bryant-logo.png"
              alt="Bryant University"
              className="h-9 w-9 rounded-full object-contain bg-white p-0.5"
            />
            <span className="text-lg font-bold text-white">
              Fol<span className="text-bryant-gold">io</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/clubs"
              className="text-sm font-medium text-white transition-colors hover:text-bryant-gold"
            >
              Explore Clubs
            </Link>
            <Link
              href="/showcase"
              className="text-sm font-medium text-white transition-colors hover:text-bryant-gold"
            >
              Showcase
            </Link>
            <Link
              href="/employers"
              className="text-sm font-medium text-white transition-colors hover:text-bryant-gold"
            >
              For Employers
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

        <div className="relative z-10 flex min-h-screen items-center">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 text-center">
            <div className="mx-auto mb-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build. Showcase.{" "}
              <span className="bg-gradient-to-r from-bryant-gold to-bryant-gold-light bg-clip-text text-transparent">
                Get Hired.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
              The portfolio platform for Bryant students. Show employers what you
              build outside the classroom.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/clubs">
                <Button size="lg" className="min-w-[200px]">
                  Explore Clubs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] border-white/20 text-white hover:bg-white/10"
                >
                  Create Your Account
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-white/40">
              Join 180+ students across 12 active clubs
            </p>

            <div className="mx-auto mt-20 h-px w-full max-w-lg bg-gradient-to-r from-transparent via-bryant-gold/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-bryant-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-bryant-gray-500">
              Three steps from student to standout candidate
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-bryant-gold/10">
                    <Icon className="h-8 w-8 text-bryant-gold" />
                  </div>
                  <span className="text-5xl font-extrabold text-bryant-gray-100">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-bryant-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-bryant-gray-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-bryant-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-bryant-gray-900 sm:text-4xl">
              What Students Are Building
            </h2>
            <p className="mt-3 text-bryant-gray-500">
              Real projects, real skills, real impact
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <Card
                key={project.title}
                className="group transition-all hover:shadow-lg hover:border-bryant-gold/40"
              >
                <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />
                <CardContent className="py-6">
                  <h3 className="text-lg font-bold text-bryant-gray-900 group-hover:text-bryant-gold transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-bryant-gray-400">
                    by {project.author}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {project.tools.map((tool) => (
                      <Badge key={tool} variant="tool">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-bryant-gray-400">
                      <Eye className="h-3 w-3" />
                      {project.views.toLocaleString()} views
                    </span>
                    <span className="text-sm font-medium text-bryant-gold group-hover:underline">
                      View Project <ArrowRight className="inline h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/showcase">
              <Button variant="outline" size="lg">
                Browse All Projects
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student CTA */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-bryant-gray-900 sm:text-4xl">
                Your club. Your portfolio.{" "}
                <span className="text-bryant-gold">Your career.</span>
              </h2>
              <p className="mt-4 text-lg text-bryant-gray-500 leading-relaxed">
                Join clubs that match your interests, build real projects with your peers,
                track your growth with an impact score, and let employers discover your work.
                Folio turns your extracurriculars into career opportunities.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Join any club on campus and collaborate on real projects",
                  "Build a portfolio that goes beyond your resume",
                  "Track job applications and get AI-powered project recommendations",
                  "Event summaries and engagement scores show your involvement",
                  "Public profiles let employers find you by the skills you've actually used",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-bryant-gold/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-bryant-gold" />
                    </div>
                    <p className="text-sm text-bryant-gray-600">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <Link href="/clubs">
                  <Button size="lg">
                    <Building2 className="h-4 w-4" />
                    Browse Clubs
                  </Button>
                </Link>
                <Link href="/my">
                  <Button variant="outline" size="lg">
                    My Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Club Portals", desc: "Dashboard, feed, events, projects", icon: Building2 },
                { label: "Job Tracker", desc: "LinkedIn, Indeed, Handshake links", icon: Briefcase },
                { label: "AI Recommendations", desc: "Project ideas tailored to your club", icon: Layers },
                { label: "Weekly Reports", desc: "PDF summaries of campus activity", icon: Calendar },
              ].map((feat) => (
                <Card key={feat.label} className="text-center">
                  <CardContent className="py-6">
                    <feat.icon className="mx-auto mb-3 h-8 w-8 text-bryant-gold" />
                    <h3 className="text-sm font-bold text-bryant-gray-900">{feat.label}</h3>
                    <p className="mt-1 text-xs text-bryant-gray-500">{feat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Employer CTA */}
      <section className="bg-gradient-to-b from-bryant-black to-bryant-gray-900 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-bryant-gold" />
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Hiring? Find your next intern.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Search Bryant students by skills, tools, and experience. Real
            projects. Real results.
          </p>
          <div className="mt-8">
            <Link href="/employers">
              <Button size="lg" className="min-w-[200px]">
                Search Candidates
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bryant-black px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="mb-3 h-1 w-8 rounded-full bg-bryant-gold" />
              <h3 className="text-lg font-bold text-white">
                Fol<span className="text-bryant-gold">io</span>
              </h3>
              <p className="mt-2 text-sm text-white/40">
                The portfolio platform for Bryant University students.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                For Students
              </h4>
              <ul className="space-y-2">
                <li><Link href="/clubs" className="text-sm text-white/60 transition-colors hover:text-white">Explore Clubs</Link></li>
                <li><Link href="/my" className="text-sm text-white/60 transition-colors hover:text-white">My Dashboard</Link></li>
                <li><Link href="/my/applications" className="text-sm text-white/60 transition-colors hover:text-white">Job Tracker</Link></li>
                <li><Link href="/campus-feed" className="text-sm text-white/60 transition-colors hover:text-white">Weekly Report</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                For Employers
              </h4>
              <ul className="space-y-2">
                <li><Link href="/showcase" className="text-sm text-white/60 transition-colors hover:text-white">Student Showcase</Link></li>
                <li><Link href="/employers" className="text-sm text-white/60 transition-colors hover:text-white">Search Candidates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                Account
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
