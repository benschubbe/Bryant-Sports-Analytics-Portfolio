"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Users,
  Trophy,
  FolderOpen,
  MessageSquare,
  Briefcase,
  ChevronRight,
  Activity,
} from "lucide-react";

/* ================================================================== */
/*  ROCKET LAUNCH INTRO                                                */
/* ================================================================== */

function RocketIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"countdown" | "launch" | "trail" | "done">("countdown");
  const [countdownNum, setCountdownNum] = useState(3);

  useEffect(() => {
    // Countdown: 3 → 2 → 1
    const t1 = setTimeout(() => setCountdownNum(2), 700);
    const t2 = setTimeout(() => setCountdownNum(1), 1400);
    const t3 = setTimeout(() => setPhase("launch"), 2100);
    const t4 = setTimeout(() => setPhase("trail"), 3200);
    const t5 = setTimeout(() => setPhase("done"), 4400);
    const t6 = setTimeout(onComplete, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-bryant-black transition-opacity duration-500 ${phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <style>{`
        @keyframes shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } }
        @keyframes rocket-launch { 0% { transform: translateY(0) scale(1) } 100% { transform: translateY(-120vh) scale(0.3) } }
        @keyframes flame-flicker { 0%,100% { transform: scaleY(1) scaleX(1) } 50% { transform: scaleY(1.3) scaleX(0.8) } }
        @keyframes ball-burst { 0% { transform: translate(0,0) scale(1); opacity: 1 } 100% { opacity: 0 } }
        @keyframes smoke-rise { 0% { transform: translateY(0) scale(1); opacity: 0.4 } 100% { transform: translateY(-80px) scale(3); opacity: 0 } }
        @keyframes star-twinkle { 0%,100% { opacity: 0.2 } 50% { opacity: 1 } }
        @keyframes countdown-pop { 0% { transform: scale(0.5); opacity: 0 } 50% { transform: scale(1.2); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes exhaust-ball { 0% { transform: translateY(0) scale(0.8); opacity: 1 } 50% { opacity: 0.8 } 100% { transform: translateY(200px) scale(0.2); opacity: 0 } }
      `}</style>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() > 0.7 ? 3 : 2,
            height: Math.random() > 0.7 ? 3 : 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `star-twinkle ${1.5 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        />
      ))}

      {/* Countdown */}
      {phase === "countdown" && (
        <div key={countdownNum} className="text-8xl font-black text-bryant-gold" style={{ animation: "countdown-pop 0.6s ease-out" }}>
          {countdownNum}
        </div>
      )}

      {/* Rocket + Flames + Sports Ball Exhaust */}
      {(phase === "launch" || phase === "trail") && (
        <div
          className="absolute"
          style={{
            bottom: "30%",
            animation: phase === "launch" ? "shake 0.1s linear infinite" : "rocket-launch 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Rocket body */}
          <svg width="80" height="140" viewBox="0 0 80 140" className="relative z-10">
            {/* Nose cone */}
            <path d="M40 0 L55 40 L25 40 Z" fill="#b5985a" />
            {/* Body */}
            <rect x="25" y="40" width="30" height="60" rx="3" fill="#e5e7eb" />
            {/* Window */}
            <circle cx="40" cy="65" r="8" fill="#1a1a1a" stroke="#b5985a" strokeWidth="2" />
            <circle cx="40" cy="65" r="4" fill="#3b82f6" opacity="0.8" />
            {/* Fins */}
            <path d="M25 85 L10 110 L25 100 Z" fill="#b5985a" />
            <path d="M55 85 L70 110 L55 100 Z" fill="#b5985a" />
            {/* Bryant "B" */}
            <text x="40" y="55" textAnchor="middle" fill="#b5985a" fontSize="12" fontWeight="bold">B</text>
          </svg>

          {/* Flames */}
          <div className="flex justify-center -mt-1">
            <div className="w-6 h-16 rounded-b-full bg-gradient-to-b from-bryant-gold via-orange-500 to-red-600 opacity-90" style={{ animation: "flame-flicker 0.15s ease-in-out infinite", transformOrigin: "top" }} />
            <div className="w-4 h-12 -ml-1 rounded-b-full bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 opacity-70" style={{ animation: "flame-flicker 0.12s ease-in-out 0.05s infinite", transformOrigin: "top" }} />
          </div>

          {/* Sports balls coming out of the exhaust */}
          {phase === "trail" && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4">
              {/* Football */}
              <div className="absolute" style={{ left: -20, animation: "exhaust-ball 1s ease-out 0s forwards" }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#8B4513" transform="rotate(-30 12 12)" /><path d="M7 9 L17 15" stroke="white" strokeWidth="1" /><path d="M9 8 L9 12 M11 7 L11 13 M13 8 L13 14 M15 9 L15 13" stroke="white" strokeWidth="0.5" /></svg>
              </div>
              {/* Basketball */}
              <div className="absolute" style={{ left: 10, animation: "exhaust-ball 1s ease-out 0.15s forwards" }}>
                <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f97316" /><path d="M2 12 H22 M12 2 V22 M4 4 Q12 10 20 4 M4 20 Q12 14 20 20" stroke="#8B4513" strokeWidth="0.8" fill="none" /></svg>
              </div>
              {/* Baseball */}
              <div className="absolute" style={{ left: -5, animation: "exhaust-ball 1s ease-out 0.3s forwards" }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="white" /><path d="M6 4 Q8 8 6 12 Q4 16 6 20" stroke="red" strokeWidth="1.2" fill="none" /><path d="M18 4 Q16 8 18 12 Q20 16 18 20" stroke="red" strokeWidth="1.2" fill="none" /></svg>
              </div>
              {/* Soccer ball */}
              <div className="absolute" style={{ left: 15, animation: "exhaust-ball 1.1s ease-out 0.45s forwards" }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="white" /><path d="M12 2 L8 7 L4 6 M12 2 L16 7 L20 6 M4 6 L2 12 L4 18 M20 6 L22 12 L20 18 M4 18 L8 17 L12 22 M20 18 L16 17 L12 22 M8 7 L12 10 L16 7 M8 17 L12 14 L16 17 M2 12 L8 12 M22 12 L16 12" stroke="#333" strokeWidth="0.6" fill="none" /></svg>
              </div>
              {/* Hockey puck */}
              <div className="absolute" style={{ left: 0, animation: "exhaust-ball 0.9s ease-out 0.6s forwards" }}>
                <svg width="18" height="12" viewBox="0 0 24 16"><ellipse cx="12" cy="8" rx="10" ry="6" fill="#1a1a1a" stroke="#555" strokeWidth="1" /></svg>
              </div>
            </div>
          )}

          {/* Smoke puffs */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: 30 + i * 10,
                height: 30 + i * 10,
                bottom: -(40 + i * 20),
                left: `calc(50% - ${(30 + i * 10) / 2}px + ${(i % 2 ? 15 : -15)}px)`,
                animation: `smoke-rise ${1 + i * 0.3}s ease-out ${i * 0.15}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* "LAUNCH" text */}
      {phase === "launch" && (
        <div className="absolute bottom-16 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-bryant-gold/60" style={{ animation: "shake 0.1s linear infinite" }}>
            Launching Bryant Analytics
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  LANDING PAGE (same as before)                                      */
/* ================================================================== */

const PARTICLES = [
  { label: "EPA", x: 8, y: 18, delay: 0, dur: 18 },
  { label: "xG", x: 85, y: 25, delay: 2, dur: 22 },
  { label: "WAR", x: 72, y: 65, delay: 4, dur: 20 },
  { label: "PER", x: 15, y: 72, delay: 1, dur: 16 },
  { label: "wOBA", x: 55, y: 12, delay: 3, dur: 24 },
  { label: "VORP", x: 92, y: 78, delay: 5, dur: 19 },
  { label: "QBR", x: 35, y: 82, delay: 2.5, dur: 21 },
  { label: "eFG%", x: 48, y: 42, delay: 1.5, dur: 17 },
  { label: "FIP", x: 20, y: 45, delay: 3.5, dur: 23 },
  { label: "RAPTOR", x: 78, y: 38, delay: 0.5, dur: 15 },
];

function AnimatedBars() {
  const bars = [40, 65, 45, 80, 55, 70, 35, 90, 60, 75, 50, 85];
  return (
    <div className="flex items-end gap-[3px] h-16">
      {bars.map((h, i) => (
        <div key={i} className="w-2 rounded-t bg-bryant-gold/30" style={{ height: `${h}%`, animation: `pulse-bar 2s ease-in-out ${i * 0.15}s infinite alternate` }} />
      ))}
    </div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / 2000, 1);
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{count}{suffix}</>;
}

const steps = [
  { icon: FolderOpen, title: "Build Your Portfolio", desc: "Publish real analytics projects that prove what you can do — not just what courses you took." },
  { icon: MessageSquare, title: "Get Peer Feedback", desc: "Structured reviews from classmates and alumni sharpen your work before hiring managers see it." },
  { icon: Users, title: "Connect with Alumni", desc: "Direct mentorship from Bryant grads at NBA, NFL, MLB teams, ESPN, and DraftKings." },
  { icon: Briefcase, title: "Land the Job", desc: "Job board, resume builder, and interview prep built specifically for sports analytics careers." },
];

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setMounted(true);
  }, []);

  // Skip intro if user has seen it this session
  useEffect(() => {
    if (sessionStorage.getItem("intro-seen")) {
      setShowIntro(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) {
      sessionStorage.setItem("intro-seen", "1");
    }
  }, [showIntro]);

  return (
    <div className="min-h-screen bg-bryant-black text-white overflow-hidden">
      {/* Rocket intro */}
      {showIntro && <RocketIntro onComplete={handleIntroComplete} />}

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-20px) } }
        @keyframes drift { 0% { transform: translate(0,0) rotate(0deg) } 25% { transform: translate(10px,-15px) rotate(2deg) } 50% { transform: translate(-5px,-25px) rotate(-1deg) } 75% { transform: translate(15px,-10px) rotate(1deg) } 100% { transform: translate(0,0) rotate(0deg) } }
        @keyframes pulse-bar { 0% { height: 30%; opacity: 0.3 } 100% { height: 90%; opacity: 0.6 } }
        @keyframes scan-line { 0% { transform: translateY(-100%) } 100% { transform: translateY(100vh) } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes glow { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
        .fade-up { animation: fade-up 0.8s ease-out forwards; opacity: 0; }
        .fade-up-d1 { animation-delay: 0.1s }
        .fade-up-d2 { animation-delay: 0.2s }
        .fade-up-d3 { animation-delay: 0.3s }
        .fade-up-d4 { animation-delay: 0.5s }
      `}</style>

      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-bryant-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-bryant-gold/20 animate-pulse" />
              <Activity className="relative h-5 w-5 text-bryant-gold" />
            </div>
            <span className="text-lg font-bold">Bryant <span className="text-bryant-gold">Analytics</span></span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-white/50 transition-colors hover:text-white">Features</Link>
            <Link href="#how-it-works" className="text-sm text-white/50 transition-colors hover:text-white">How It Works</Link>
            <Link href="/login" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/10">Sign In</Link>
            <Link href="/register" className="rounded-lg bg-bryant-gold px-4 py-2 text-sm font-semibold transition-all hover:bg-bryant-gold-light">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(181,152,90,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(181,152,90,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-bryant-gold/30 to-transparent" style={{ animation: "scan-line 8s linear infinite" }} />
        </div>
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-bryant-gold/[0.07] blur-[120px]" style={{ animation: "drift 20s ease-in-out infinite" }} />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-[100px]" style={{ animation: "drift 25s ease-in-out 5s infinite" }} />

        {mounted && PARTICLES.map((p) => (
          <div key={p.label} className="absolute hidden md:block pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: `drift ${p.dur}s ease-in-out ${p.delay}s infinite` }}>
            <div className="rounded-md border border-bryant-gold/20 bg-bryant-gold/5 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-bryant-gold/40 backdrop-blur-sm">{p.label}</div>
          </div>
        ))}

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-bryant-gold/20 bg-bryant-gold/5 px-4 py-1.5 text-xs font-medium text-bryant-gold backdrop-blur-sm">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bryant-gold opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-bryant-gold" /></span>
            Bryant University Sports Analytics
          </div>

          <h1 className="fade-up fade-up-d1 mx-auto max-w-5xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl leading-[0.9]">
            Where sports data<br />
            <span className="relative">
              <span className="bg-gradient-to-r from-bryant-gold via-bryant-gold-light to-bryant-gold bg-clip-text text-transparent">meets career</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none"><path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="url(#gold-grad)" strokeWidth="3" strokeLinecap="round" /><defs><linearGradient id="gold-grad" x1="0" y1="0" x2="300" y2="0"><stop offset="0%" stopColor="#b5985a" stopOpacity="0" /><stop offset="50%" stopColor="#b5985a" /><stop offset="100%" stopColor="#b5985a" stopOpacity="0" /></linearGradient></defs></svg>
            </span>
          </h1>

          <p className="fade-up fade-up-d2 mx-auto mt-8 max-w-2xl text-lg text-white/50 leading-relaxed sm:text-xl">The platform that turns your analytics projects into a professional portfolio, connects you with alumni in pro sports, and gives you the edge to get hired.</p>

          <div className="fade-up fade-up-d3 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="group relative inline-flex items-center gap-2 rounded-xl bg-bryant-gold px-8 py-4 text-base font-semibold transition-all hover:bg-bryant-gold-light hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(181,152,90,0.3)]">
              Get Started Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium transition-all hover:bg-white/10 hover:border-white/20">
              Explore Projects <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="fade-up fade-up-d4 mt-20 flex justify-center">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-8 py-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-xs text-white/30 font-mono">
                <div className="h-1.5 w-1.5 rounded-full bg-bryant-gold" style={{ animation: "glow 2s ease-in-out infinite" }} />
                LIVE ANALYTICS FEED
              </div>
              <AnimatedBars />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bryant-black to-transparent" />
      </section>

      {/* Stats */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { icon: FolderOpen, value: 150, suffix: "+", label: "Projects Published", color: "from-bryant-gold/20 to-bryant-gold/5" },
            { icon: Users, value: 45, suffix: "", label: "Alumni in Pro Sports", color: "from-blue-500/20 to-blue-500/5" },
            { icon: Trophy, value: 12, suffix: "", label: "Challenges Completed", color: "from-emerald-500/20 to-emerald-500/5" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center transition-all hover:border-white/10 hover:bg-white/[0.04]">
                <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}><Icon className="h-7 w-7 text-bryant-gold" /></div>
                <p className="text-5xl font-bold tracking-tight">{mounted ? <Counter target={stat.value} suffix={stat.suffix} /> : `${stat.value}${stat.suffix}`}</p>
                <p className="mt-2 text-sm text-white/40">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bryant-gold/20 bg-bryant-gold/5 px-3 py-1 text-xs font-medium text-bryant-gold"><Zap className="h-3 w-3" />PLATFORM FEATURES</div>
            <h2 className="text-4xl font-bold">Everything you need to <span className="text-bryant-gold">stand out</span></h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BarChart3, title: "Project Portfolio", desc: "Upload analytics projects with rich metadata, visualizations, and code." },
              { icon: Target, title: "Peer Reviews", desc: "Get structured feedback on methodology, visualization, writing, and code quality." },
              { icon: TrendingUp, title: "Weekly Challenges", desc: "Compete in data challenges with real sports datasets." },
              { icon: Briefcase, title: "Job Board & Tracker", desc: "Curated listings from NFL, NBA, MLB teams, ESPN, DraftKings, and more." },
              { icon: Users, title: "Alumni Network", desc: "Connect with Bryant graduates working in professional sports." },
              { icon: Activity, title: "Career Readiness", desc: "Track your growth with a Career Readiness Score." },
            ].map((f) => { const Icon = f.icon; return (
              <div key={f.title} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-all hover:border-white/10 hover:bg-white/[0.04]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-bryant-gold/10"><Icon className="h-5 w-5 text-bryant-gold" /></div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{f.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bryant-gold/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold">From classroom to <span className="text-bryant-gold">career</span></h2>
            <p className="mt-4 text-white/40">Four steps to launching your sports analytics career</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => { const Icon = step.icon; return (
              <div key={step.title} className="relative text-center">
                {i < 3 && <div className="absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] hidden h-px bg-gradient-to-r from-bryant-gold/30 to-transparent lg:block" />}
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-bryant-gold/10" />
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bryant-gold text-[10px] font-bold text-bryant-black">{i + 1}</div>
                  <Icon className="relative h-7 w-7 text-bryant-gold" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{step.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-bryant-gold/20 bg-gradient-to-br from-bryant-gold/10 via-transparent to-bryant-gold/5 p-12 text-center sm:p-16">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-bryant-gold/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to build your edge?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/50">Join the platform that gives Bryant sports analytics students a dominant competitive advantage.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-bryant-gold px-8 py-4 text-base font-semibold transition-all hover:bg-bryant-gold-light hover:shadow-[0_0_40px_rgba(181,152,90,0.3)]">
                  Create Free Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Already have an account? Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3"><Activity className="h-5 w-5 text-bryant-gold" /><span className="font-bold">Bryant <span className="text-bryant-gold">Analytics</span></span></div>
              <p className="text-sm text-white/30">Built by the Bryant University Sports Analytics program.</p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Platform</h4>
              <ul className="space-y-2">{["Projects", "Challenges", "Job Board", "Alumni"].map((item) => <li key={item}><Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link></li>)}</ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Resources</h4>
              <ul className="space-y-2">{["Tutorials", "Learning Paths", "Mentorship", "Events"].map((item) => <li key={item}><Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link></li>)}</ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6"><p className="text-center text-xs text-white/20">&copy; {new Date().getFullYear()} Bryant University Sports Analytics. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}
