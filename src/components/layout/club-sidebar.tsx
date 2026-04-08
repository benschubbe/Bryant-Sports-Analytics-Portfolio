"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  FolderOpen,
  Layers,
  Search,
  MessageSquare,
  Hash,
  Star,
  Briefcase,
  ClipboardList,
  Map,
  Trophy,
  BookOpen,
  Award,
  Users,
  UserPlus,
  Calendar,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface ClubSidebarProps {
  club: {
    name: string;
    slug: string;
    color?: string;
    logoUrl?: string;
  };
}

function getNavSections(slug: string): NavSection[] {
  const prefix = `/clubs/${slug}`;
  return [
    {
      title: "SHOWCASE",
      items: [
        { label: "Dashboard", href: `${prefix}/dashboard`, icon: BarChart3 },
        { label: "Portfolio", href: `${prefix}/portfolio`, icon: FolderOpen },
        { label: "Projects", href: `${prefix}/projects`, icon: Layers },
        { label: "Gallery", href: `${prefix}/gallery`, icon: Search },
      ],
    },
    {
      title: "COMMUNITY",
      items: [
        { label: "Feed", href: `${prefix}/feed`, icon: MessageSquare },
        { label: "Channels", href: `${prefix}/channels`, icon: Hash },
        { label: "Reviews", href: `${prefix}/reviews`, icon: Star },
      ],
    },
    {
      title: "CAREER",
      items: [
        { label: "Jobs", href: `${prefix}/jobs`, icon: Briefcase },
        { label: "Applications", href: `${prefix}/applications`, icon: ClipboardList },
      ],
    },
    {
      title: "GROWTH",
      items: [
        { label: "Learning", href: `${prefix}/learning`, icon: Map },
        { label: "Challenges", href: `${prefix}/challenges`, icon: Trophy },
        { label: "Tutorials", href: `${prefix}/tutorials`, icon: BookOpen },
        { label: "Certifications", href: `${prefix}/certifications`, icon: Award },
      ],
    },
    {
      title: "NETWORK",
      items: [
        { label: "Alumni", href: `${prefix}/alumni`, icon: Users },
        { label: "Mentorship", href: `${prefix}/mentorship`, icon: UserPlus },
        { label: "Events", href: `${prefix}/events`, icon: Calendar },
        { label: "Members", href: `${prefix}/members`, icon: Users },
      ],
    },
  ];
}

export function ClubSidebar({ club }: ClubSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navSections = getNavSections(club.slug);

  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "STUDENT";
  const initials = getInitials(userName);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-bryant-black text-white">
      {/* Back to Clubs */}
      <div className="px-6 pt-4">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clubs
        </Link>
      </div>

      {/* Club Logo / Name */}
      <div className="px-6 pt-4 pb-4">
        <Link href={`/clubs/${club.slug}/dashboard`}>
          <div
            className="mb-2 h-1 w-10 rounded-full"
            style={{ backgroundColor: club.color || "#C5A44E" }}
          />
          <h1 className="text-lg font-bold tracking-tight">
            {club.name}
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-4 text-[11px] font-semibold tracking-widest text-white/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-bryant-gold/20 text-bryant-gold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: User + Settings */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bryant-gold/20 text-sm font-semibold text-bryant-gold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <span className="inline-block rounded-full bg-bryant-gold/10 px-2 py-0.5 text-[10px] font-medium capitalize text-bryant-gold">
              {userRole.toLowerCase()}
            </span>
          </div>
          <Link
            href={`/clubs/${club.slug}/settings`}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
