# Bryant University Club Platform — Prompt

## Vision

Build a full-stack web application called **Bryant University Club Platform** — a campus-wide portal system that gives every student organization at Bryant University its own branded digital home. The platform replaces the previous single-club model (Bryant Sports Analytics Hub) with a multi-club architecture where any recognized campus organization can register and receive an auto-generated portal with a full feature suite.

The platform serves current students, faculty advisors, alumni, and recruiters across all participating clubs.

---

## Core Architecture: Multi-Club Support

The central architectural change is the **Club** model. Every piece of club-scoped content (projects, posts, channels, events, jobs, challenges, tutorials, learning paths, mentor matches, weekly digests) carries an optional `clubId` foreign key linking it to a specific club. Content without a `clubId` is campus-wide.

### Club Model
Each club has: name, unique slug, description, domain, logo URL, banner URL, accent color, and an active/inactive flag. The slug drives routing (`/clubs/[slug]`).

### Club Membership
Users join clubs through a `ClubMembership` record with a role: **PRESIDENT**, **OFFICER**, or **MEMBER**. A user can belong to multiple clubs with different roles in each. The `userId + clubId` combination is unique.

### Club Invites
Presidents and officers can invite new members via email using a `ClubInvite` record with a unique token, expiration date, and optional role assignment.

### Campus-Wide User Roles
Separately from club roles, every user has a campus-wide role on their profile: **STUDENT** (default), **FACULTY**, or **ADMIN**. These control platform-level permissions.

---

## Routing Structure

### `/clubs` — Club Directory
Lists all active clubs with name, logo, description, and member count.

### `/clubs/[slug]` — Individual Club Portal
Each club gets sub-routes for every feature:
- Landing page, projects, feed, events, jobs, mentorship, channels, challenges, tutorials, learning paths, alumni, certifications, gallery, reviews, and settings.

### `/my` — Cross-Club Dashboard
Personal dashboard aggregating activity across all clubs:
- Overview, club list, projects, applications, certifications, messages, analytics, and settings.

### `/portfolio/[username]` — Public Portfolio
User's public-facing page with bio, projects across all clubs, certifications, and external links.

---

## Feature Set (Per Club)

Each club portal includes all of the following. Content is scoped to the club unless the user views the cross-club dashboard.

1. **Projects** — Portfolio system with titles, abstracts, write-ups, methodology, tools, media embeds, GitHub links, tagging, and visibility controls (public, club-only, private).

2. **Feed** — Social feed with rich text posts, images, code snippets, link previews, reactions, and threaded comments. Posts belong to channels within the club.

3. **Events** — Calendar with RSVP tracking. Officers create events; members RSVP and sync to external calendars.

4. **Jobs** — Domain-scoped job and internship board. Filter by role type, location, experience level, remote status. Kanban application tracker.

5. **Mentorship** — Mentor matching between students and alumni. Students describe interests and goals; algorithm suggests mentors. Mentors set availability and cadence.

6. **Channels** — Discussion channels organized by topic (sport, course, open). Pinned posts for announcements.

7. **Challenges** — Data challenges with datasets and problem statements. Members submit solutions as projects. Community voting and leaderboards.

8. **Tutorials** — Member-contributed guides on tools and techniques. Peer-reviewed and rated. Faculty "Staff Pick" badge.

9. **Learning Paths** — Curated roadmaps linking tutorials, external courses, example projects, and challenges.

10. **Alumni Network** — Searchable alumni directory filtered by employer, title, graduation year, location. Career trajectory and mentorship availability.

11. **Certifications** — Members log external courses and certifications. Displayed on portfolio pages.

12. **Gallery** — Photo and media gallery for club events and activities.

13. **Reviews** — Structured peer review: methodology, visualization, writing, code quality, and rigor scores with written feedback.

---

## No Sample Data Philosophy

New club portals start completely empty. Instead of seeding fake content, the platform displays **demo boxes** — inline UI prompts explaining what each section does and how to populate it. Demo boxes disappear once the first real item is added. Every piece of content on the platform is genuine.

---

## Technical Stack

- **Frontend**: Next.js (React) with TypeScript, Tailwind CSS, responsive mobile-first design
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with Bryant SSO (SAML/OAuth), Google OAuth, GitHub OAuth; campus-wide roles + per-club membership roles
- **Deployment**: Vercel (frontend), PostgreSQL on Railway or AWS
- **Email**: SendGrid or Resend for invites, digests, and notifications
- **AI**: Claude API for digest summarization, resume suggestions, tag recommendations, and career readiness nudges

---

## Design Principles

- **Club-first**: Every club gets the same powerful toolkit. No club is privileged over another.
- **Show, don't tell**: The platform proves competence through real artifacts, not placeholder content.
- **Low floor, high ceiling**: A brand-new club with three members and a mature club with a hundred should both feel at home.
- **Bryant identity**: University brand colors and tone, modern and professional UI.
- **Open by default**: Encourage public sharing. Privacy controls exist but visibility is the point.
- **Zero sample data**: Demo boxes instead of fake content. Every item on the platform is real.

---

## Key Database Changes from Previous Version

The previous schema supported a single club (Bryant Sports Analytics Hub). The new schema adds:

- `Club` model with slug-based routing, branding fields, and relations to all club-scoped content
- `ClubMembership` model with per-club roles (PRESIDENT, OFFICER, MEMBER) and a unique constraint on userId + clubId
- `ClubInvite` model with token-based email invitations
- Optional `clubId` foreign key added to: Project, Post, Channel, Event, Job, Challenge, LearningPath, Tutorial, MentorMatch, WeeklyDigest
- `memberships` relation added to User model
- Database indexes on every new `clubId` column for query performance
