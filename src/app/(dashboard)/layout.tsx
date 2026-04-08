"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Building2 } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/portfolio": "Portfolio",
  "/projects": "My Projects",
  "/gallery": "Gallery",
  "/feed": "Feed",
  "/channels": "Channels",
  "/messages": "Messages",
  "/reviews": "Peer Reviews",
  "/jobs": "Job Board",
  "/applications": "Applications",
  "/resume": "Resume Builder",
  "/interview-prep": "Interview Prep",
  "/learning": "Learning Paths",
  "/challenges": "Challenges",
  "/tutorials": "Tutorials",
  "/certifications": "Certifications",
  "/alumni": "Alumni Directory",
  "/mentorship": "Mentorship",
  "/events": "Events",
  "/settings": "Settings",
  "/dashboard": "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <AppShell pageTitle={pageTitle}>
      {/* All Clubs banner */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-bryant-gray-200 bg-white px-4 py-2.5">
        <Building2 className="h-4 w-4 text-bryant-gold" />
        <span className="text-sm text-bryant-gray-600">
          Looking for all campus clubs?
        </span>
        <Link
          href="/clubs"
          className="text-sm font-medium text-bryant-gold hover:underline"
        >
          Visit Folio
        </Link>
      </div>
      {children}
    </AppShell>
  );
}
