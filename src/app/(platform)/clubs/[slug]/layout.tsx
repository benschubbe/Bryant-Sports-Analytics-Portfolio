"use client";

import { useParams, usePathname } from "next/navigation";
import { ClubSidebar } from "@/components/layout/club-sidebar";
import { ClubTopbar } from "@/components/layout/club-topbar";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  portfolio: "Portfolio",
  projects: "Projects",
  gallery: "Gallery",
  feed: "Feed",
  channels: "Channels",
  reviews: "Reviews",
  jobs: "Job Board",
  applications: "Applications",
  learning: "Learning Paths",
  challenges: "Challenges",
  tutorials: "Tutorials",
  certifications: "Certifications",
  alumni: "Alumni Directory",
  mentorship: "Mentorship",
  events: "Events",
  members: "Members",
  settings: "Settings",
};

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  // Derive club name from slug for display (title case)
  const clubName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Determine current page title from last path segment
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "dashboard";
  const pageTitle = pageTitles[lastSegment] || "Dashboard";

  const club = {
    name: clubName,
    slug,
  };

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <ClubSidebar club={club} />

      {/* Main content area offset by sidebar width */}
      <div className="ml-64 flex flex-1 flex-col">
        <ClubTopbar clubName={clubName} pageTitle={pageTitle} />

        <main className="flex-1 overflow-y-auto bg-bryant-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
