# Bryant University Club Platform — Specification

## Platform Overview

The Bryant University Club Platform is a campus-wide portal system that gives every student organization its own branded digital home. Instead of a single-club application, the platform hosts multiple clubs under one roof. Each club gets an auto-generated portal with a full suite of features: project showcases, social feeds, event calendars, job boards, mentorship matching, learning paths, challenges, tutorials, channels, alumni networks, certifications, gallery pages, and peer reviews.

The platform serves students, faculty advisors, alumni, and recruiters across all participating clubs at Bryant University.

---

## Club Registration and Auto-Generated Portals

Any recognized campus organization can register a club on the platform. Registration creates a portal with:

- A unique slug (e.g., `/clubs/sports-analytics`)
- Custom branding: club name, logo, banner image, and accent color
- A domain tag describing the club's focus area
- An active/inactive toggle controlled by campus administrators

Once registered, the club portal is immediately available with all features enabled. Club officers populate it with content — there is no sample data seeded into new portals.

---

## User Roles

### Campus-Wide Roles

Every user has a single campus-wide role stored on their profile:

- **STUDENT** — Default role for all new registrations. Full access to join clubs, create content, and use career tools.
- **FACULTY** — Faculty advisors. Can view program-level analytics and moderate content across clubs they advise.
- **ADMIN** — Platform administrators. Full access to all clubs, user management, and platform configuration.

### Per-Club Roles

Within each club, a user holds one of three membership roles:

- **PRESIDENT** — Full control over the club portal: manage members, send invites, edit club settings, and moderate all club content.
- **OFFICER** — Can create and manage club content (events, challenges, channels, learning paths) and moderate posts within the club.
- **MEMBER** — Can participate in all club activities: post in feeds, submit projects, RSVP to events, enter challenges, and access club resources.

A user can belong to multiple clubs with different roles in each.

---

## Routing

### `/clubs` — Club Directory

Overview page listing all active clubs on the platform. Shows club name, logo, description, member count, and a link to each portal.

### `/clubs/[slug]` — Individual Club Portal

Each club's home at its unique slug. Sub-routes include:

- `/clubs/[slug]` — Club landing page with recent activity, upcoming events, and featured projects
- `/clubs/[slug]/projects` — Project gallery scoped to this club
- `/clubs/[slug]/feed` — Social feed for club posts and discussions
- `/clubs/[slug]/events` — Event calendar and RSVP management
- `/clubs/[slug]/jobs` — Job and internship board relevant to the club's domain
- `/clubs/[slug]/mentorship` — Mentor matching within the club's alumni network
- `/clubs/[slug]/channels` — Discussion channels organized by topic
- `/clubs/[slug]/challenges` — Data challenges and competitions
- `/clubs/[slug]/tutorials` — Tutorials and guides contributed by members
- `/clubs/[slug]/learning-paths` — Curated skill roadmaps
- `/clubs/[slug]/alumni` — Alumni directory filtered to club members
- `/clubs/[slug]/certifications` — Certification tracker for club members
- `/clubs/[slug]/gallery` — Photo and media gallery
- `/clubs/[slug]/reviews` — Peer review hub for club projects
- `/clubs/[slug]/settings` — Club configuration (president and officers only)

### `/my` — Cross-Club User Dashboard

A personal dashboard aggregating a user's activity across all clubs:

- `/my` — Overview: recent activity, upcoming events across clubs, notifications
- `/my/clubs` — List of clubs the user belongs to with role in each
- `/my/projects` — All projects the user has created across clubs
- `/my/applications` — Job application tracker (Kanban board)
- `/my/certifications` — Certification log
- `/my/messages` — Direct messages
- `/my/analytics` — Personal engagement metrics and career readiness score
- `/my/settings` — Profile and account settings

### `/portfolio/[username]` — Public Portfolio

Each user's public-facing portfolio page showing their bio, projects, certifications, and links. Designed to be shared on resumes and LinkedIn profiles.

---

## Features Available to Each Club

Every club portal has access to the same feature set. Content is scoped to the club — a project posted in the Sports Analytics club does not appear in the Finance Society's feed unless explicitly cross-posted.

### Projects
Members upload project pages with titles, abstracts, write-ups, methodology, tools, media embeds, and GitHub links. Projects are tagged and searchable within the club. Visibility controls (public, club-only, private) let authors decide who sees their work.

### Feed
A social feed for club announcements, questions, links, and discussion. Posts support rich text, images, code snippets, and link previews. Reactions and threaded comments on every post.

### Events
Club officers create events with title, description, type, location, and time. Members RSVP and sync events to their calendars.

### Jobs
A job and internship board scoped to the club's domain. Filter by role type, sport/industry, location, experience level, and remote status. Members track applications through a Kanban pipeline.

### Mentorship
Students request mentorship and are matched with alumni based on interests and career goals. Mentors set availability and preferred cadence.

### Channels
Discussion channels organized by topic within the club. Channels can be sport-specific, course-specific, or open-topic. Pinned posts for important resources.

### Challenges
Weekly or recurring data challenges with datasets and problem statements. Members submit solutions as projects. Community voting and leaderboards track participation.

### Tutorials
Member-contributed tutorials on tools, techniques, and data sources. Peer-reviewed and rated. Faculty can mark tutorials as "Staff Pick."

### Learning Paths
Curated, ordered roadmaps for specific career goals. Each path links to tutorials, external courses, example projects, and challenge problems.

### Alumni Network
Searchable directory of club alumni filtered by employer, job title, graduation year, and location. Alumni profiles show career trajectory and mentorship availability.

### Certifications
Members log completed external courses and certifications. Displayed on portfolio pages. The platform suggests relevant certifications based on learning paths.

### Gallery
Photo and media gallery for club events, meetings, and activities.

### Reviews
Structured peer review system. Authors mark projects as "Open for Review." Reviewers score methodology, visualization, writing, code quality, and statistical rigor with written feedback.

---

## User Dashboard — Cross-Club Activity

The `/my` dashboard gives each user a unified view across all their clubs:

- **Activity feed** aggregating recent posts, comments, and reactions from all clubs
- **Upcoming events** from every club the user belongs to
- **Project portfolio** spanning all clubs, with per-club filtering
- **Application tracker** for jobs across all club job boards
- **Personal analytics**: profile views, project engagement, peer review contributions, challenge participation, and a career readiness score
- **Suggested actions**: "Your portfolio is missing a SQL project," "3 new analyst roles match your profile," "You haven't posted in 2 weeks"

---

## No Sample Data Philosophy

The platform does not seed clubs with fake projects, placeholder posts, or dummy events. When a new club portal is created, every section starts empty. Instead of sample data, the platform uses **demo boxes** — inline UI prompts that explain what each section does and how to populate it.

Examples:

- The projects page shows: "No projects yet. Club members can showcase their work here — click New Project to get started."
- The events page shows: "No upcoming events. Officers can create events from the Events tab in club settings."
- The challenges page shows: "No active challenges. Create a challenge to give members a dataset and problem statement to solve."

Demo boxes disappear once the first real item is added to a section. This ensures every piece of content on the platform is genuine and created by real users.

---

## Technical Stack

- **Framework**: Next.js (React) with TypeScript and Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with Bryant SSO (SAML/OAuth), Google, and GitHub OAuth providers; campus-wide roles + per-club membership roles
- **Deployment**: Vercel (frontend) with PostgreSQL on Railway or AWS
- **Email**: Transactional email (SendGrid or Resend) for invites, digests, and notifications

---

## Design Principles

- **Club-first**: Every club gets the same powerful toolkit. No club is privileged over another.
- **Show, don't tell**: The platform proves competence through real artifacts, not placeholder content.
- **Low floor, high ceiling**: A brand-new club with three members and a mature club with a hundred should both feel at home.
- **Bryant identity**: University brand colors and tone, modern and professional UI.
- **Open by default**: Encourage public sharing. Privacy controls exist but visibility is the point.
- **Zero sample data**: Demo boxes instead of fake content. Every item on the platform is real.
