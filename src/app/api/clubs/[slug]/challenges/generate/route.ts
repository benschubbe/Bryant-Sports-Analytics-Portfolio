import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// LLM-style weekly challenge generator
// Uses curated templates per domain to generate relevant challenges
// In production, replace with an actual LLM API call (e.g., Claude API)

interface ChallengeTemplate {
  title: string;
  description: string;
}

const domainChallenges: Record<string, ChallengeTemplate[]> = {
  "Sports Analytics": [
    {
      title: "Player Performance Prediction",
      description:
        "Build a model to predict player performance metrics for the upcoming week using historical game data. Focus on feature engineering and model interpretability. Share your approach, accuracy metrics, and key insights.",
    },
    {
      title: "Game Outcome Visualization",
      description:
        "Create an interactive visualization that tells the story of a recent game. Use shot charts, play-by-play data, or win probability graphs. The best visualizations will clearly communicate key turning points.",
    },
    {
      title: "Draft Prospect Analysis",
      description:
        "Analyze upcoming draft prospects using available combine and college stats. Build a composite ranking system and justify your methodology. Compare your rankings to expert consensus.",
    },
    {
      title: "Injury Risk Assessment",
      description:
        "Develop a framework for assessing player injury risk based on workload, playing surface, position, and historical injury data. Present your findings with clear visualizations.",
    },
    {
      title: "Salary Cap Optimization",
      description:
        "Given a salary cap constraint, build an optimal roster using player value metrics. Define your own value model and explain the trade-offs in your roster construction.",
    },
    {
      title: "Real-Time Game Analytics Dashboard",
      description:
        "Design and prototype a real-time analytics dashboard for a sport of your choice. Focus on what metrics coaches would need during a live game and how to display them effectively.",
    },
    {
      title: "Historical Trend Analysis",
      description:
        "Pick a sport and analyze how a key metric (e.g., three-point shooting, passing yards, goals per game) has evolved over the past 20 years. What's driving the trend?",
    },
    {
      title: "Fan Engagement Metrics",
      description:
        "Propose and prototype a system for measuring fan engagement using social media data, attendance figures, or merchandise sales. What predicts a team's fanbase growth?",
    },
  ],
  "Computer Science": [
    {
      title: "Algorithm Optimization Challenge",
      description:
        "Given a dataset of 1M records, optimize a search/sort algorithm to run under 100ms. Document your approach, Big-O analysis, and benchmarks.",
    },
    {
      title: "API Design Sprint",
      description:
        "Design a RESTful API for a student marketplace app. Include endpoint documentation, data models, authentication flow, and error handling patterns.",
    },
    {
      title: "Open Source Contribution",
      description:
        "Find an open source project, identify a bug or feature request, and submit a pull request. Document your process and what you learned.",
    },
    {
      title: "Security Audit",
      description:
        "Perform a security review of a sample web application. Identify OWASP Top 10 vulnerabilities and propose fixes with code examples.",
    },
  ],
  Finance: [
    {
      title: "Portfolio Optimization",
      description:
        "Build an efficient frontier using historical stock data. Compare mean-variance optimization with equal-weight and risk-parity approaches.",
    },
    {
      title: "Financial Statement Analysis",
      description:
        "Analyze a public company's last 3 annual reports. Calculate key ratios, identify trends, and present an investment thesis.",
    },
    {
      title: "Market Sentiment Dashboard",
      description:
        "Create a dashboard that tracks market sentiment using news headlines and social media. What indicators correlate with next-day price movements?",
    },
    {
      title: "Risk Modeling Challenge",
      description:
        "Build a Value-at-Risk model for a sample portfolio. Compare parametric, historical simulation, and Monte Carlo methods.",
    },
  ],
  Marketing: [
    {
      title: "Campaign A/B Test Design",
      description:
        "Design an A/B test for a student organization's social media campaign. Define hypotheses, sample size calculations, success metrics, and analysis plan.",
    },
    {
      title: "Brand Audit",
      description:
        "Conduct a brand audit of a campus organization. Analyze their visual identity, messaging, social presence, and propose improvements.",
    },
    {
      title: "Content Strategy Sprint",
      description:
        "Create a 30-day content calendar for a club's social media. Include post types, copy, hashtag strategy, and expected engagement metrics.",
    },
  ],
};

const genericChallenges: ChallengeTemplate[] = [
  {
    title: "Data Storytelling Challenge",
    description:
      "Find a publicly available dataset relevant to your club's domain. Clean, analyze, and present your findings as a compelling narrative with visualizations. Focus on insights that would be actionable.",
  },
  {
    title: "Tool Mastery Sprint",
    description:
      "Pick a tool your club uses (Python, R, Tableau, Excel, Figma, etc.) and build something impressive in one week. Document your learning process and share tips with the club.",
  },
  {
    title: "Cross-Discipline Collaboration",
    description:
      "Partner with a member from a different background and tackle a problem that requires both skill sets. Present your collaborative process and results.",
  },
  {
    title: "Industry Research Report",
    description:
      "Research a current trend in your club's domain. Write a concise report (500-1000 words) with data backing your claims. Present key takeaways the club can act on.",
  },
  {
    title: "Workshop Design Challenge",
    description:
      "Design a 45-minute workshop that teaches a skill relevant to your club. Include slides, hands-on exercises, and assessment criteria. The best designs will be run as actual workshops.",
  },
  {
    title: "Process Improvement Proposal",
    description:
      "Identify an inefficiency in your club's operations or in a related industry process. Propose a data-driven improvement with expected impact metrics.",
  },
];

function generateWeeklyChallenge(
  clubName: string,
  domain: string | null,
): ChallengeTemplate {
  const pool = domain && domainChallenges[domain]
    ? [...domainChallenges[domain], ...genericChallenges]
    : genericChallenges;

  // Use week number as seed for consistent weekly rotation
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const index = weekNumber % pool.length;
  const template = pool[index];

  return {
    title: `Weekly Challenge: ${template.title}`,
    description: `${template.description}\n\nThis challenge is auto-generated for ${clubName}. Submit your work as a project or post in the club feed!`,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const club = await prisma.club.findUnique({ where: { slug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Only presidents and officers can generate challenges
    const membership = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: session.user.id, clubId: club.id } },
    });
    if (
      !membership ||
      !["PRESIDENT", "OFFICER"].includes(membership.role)
    ) {
      return NextResponse.json(
        { error: "Only presidents and officers can generate challenges" },
        { status: 403 },
      );
    }

    const template = generateWeeklyChallenge(club.name, club.domain);

    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const challenge = await prisma.challenge.create({
      data: {
        title: template.title,
        description: template.description,
        startDate: now,
        endDate,
        active: true,
        clubId: club.id,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Challenge generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const club = await prisma.club.findUnique({ where: { slug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Preview what the next generated challenge would be
    const template = generateWeeklyChallenge(club.name, club.domain);
    return NextResponse.json({ preview: template });
  } catch (error) {
    console.error("Challenge generate preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
