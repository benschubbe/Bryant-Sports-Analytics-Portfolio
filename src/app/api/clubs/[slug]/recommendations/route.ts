import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Smart project recommendation engine for a club
// Uses domain-specific recommendation pools with deterministic weekly rotation

interface Recommendation {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tools: string[];
  estimatedTime: string;
}

const domainRecommendations: Record<string, Recommendation[]> = {
  "Sports Analytics": [
    {
      id: "sa-1",
      title: "Win Probability Model",
      description:
        "Build a live win probability model for a sport of your choice using historical play-by-play data. Visualize how win probability shifts throughout a game.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn"],
      estimatedTime: "2-3 weeks",
    },
    {
      id: "sa-2",
      title: "Player Similarity Tool",
      description:
        "Create a tool that finds comparable players using statistical profiles. Use clustering algorithms to group players by performance metrics.",
      difficulty: "Advanced",
      tools: ["Python", "pandas", "clustering"],
      estimatedTime: "3-4 weeks",
    },
    {
      id: "sa-3",
      title: "Game Prediction Dashboard",
      description:
        "Build a dashboard predicting game outcomes using historical data. Include feature importance analysis and model accuracy tracking.",
      difficulty: "Intermediate",
      tools: ["Python", "Tableau"],
      estimatedTime: "2 weeks",
    },
    {
      id: "sa-4",
      title: "Salary Cap Optimizer",
      description:
        "Linear programming model for optimal roster construction under salary cap constraints. Maximize projected value while respecting positional requirements.",
      difficulty: "Advanced",
      tools: ["Python", "PuLP"],
      estimatedTime: "3 weeks",
    },
    {
      id: "sa-5",
      title: "Shot Chart Analyzer",
      description:
        "Visualize and analyze shooting patterns from game data. Create heatmaps and identify hot/cold zones for players or teams.",
      difficulty: "Beginner",
      tools: ["Python", "matplotlib"],
      estimatedTime: "1 week",
    },
    {
      id: "sa-6",
      title: "Draft Board Builder",
      description:
        "Weighted scoring system for ranking draft prospects. Combine combine stats, college performance, and advanced metrics into a composite score.",
      difficulty: "Intermediate",
      tools: ["Python", "pandas"],
      estimatedTime: "2 weeks",
    },
    {
      id: "sa-7",
      title: "Injury Prediction Model",
      description:
        "ML model for injury risk assessment based on workload, playing surface, position, and historical injury data.",
      difficulty: "Advanced",
      tools: ["Python", "XGBoost"],
      estimatedTime: "4 weeks",
    },
    {
      id: "sa-8",
      title: "Fan Engagement Tracker",
      description:
        "Social media sentiment analysis for teams. Track fan sentiment over time and correlate with team performance.",
      difficulty: "Intermediate",
      tools: ["Python", "NLP"],
      estimatedTime: "2-3 weeks",
    },
  ],
  "Computer Science": [
    {
      id: "cs-1",
      title: "Full-Stack CRUD App",
      description:
        "Build a complete web app with authentication, database, and API. Great for learning the full development lifecycle.",
      difficulty: "Beginner",
      tools: ["Next.js", "Prisma", "PostgreSQL"],
      estimatedTime: "2 weeks",
    },
    {
      id: "cs-2",
      title: "CLI Tool in Rust",
      description:
        "Build a performant command-line utility in Rust. Focus on error handling, argument parsing, and cross-platform compatibility.",
      difficulty: "Intermediate",
      tools: ["Rust", "clap"],
      estimatedTime: "2 weeks",
    },
    {
      id: "cs-3",
      title: "Distributed Key-Value Store",
      description:
        "Implement a simple distributed database with replication and consistency guarantees. Learn about distributed systems fundamentals.",
      difficulty: "Advanced",
      tools: ["Go", "gRPC"],
      estimatedTime: "4 weeks",
    },
    {
      id: "cs-4",
      title: "Browser Extension",
      description:
        "Build a productivity browser extension. Learn the Chrome Extension API and modern web development patterns.",
      difficulty: "Beginner",
      tools: ["JavaScript", "Chrome API"],
      estimatedTime: "1 week",
    },
    {
      id: "cs-5",
      title: "Open Source Contribution",
      description:
        "Find and contribute to an OSS project. Practice reading others' code, following contribution guidelines, and collaborating via pull requests.",
      difficulty: "Intermediate",
      tools: ["Git", "any language"],
      estimatedTime: "Ongoing",
    },
    {
      id: "cs-6",
      title: "API Rate Limiter",
      description:
        "Implement token bucket and sliding window rate limiting algorithms. Build middleware that protects APIs from abuse.",
      difficulty: "Intermediate",
      tools: ["Node.js", "Redis"],
      estimatedTime: "1 week",
    },
    {
      id: "cs-7",
      title: "Real-time Chat App",
      description:
        "WebSocket-based messaging with rooms, typing indicators, and message history. Learn real-time communication patterns.",
      difficulty: "Intermediate",
      tools: ["Next.js", "Socket.io"],
      estimatedTime: "2 weeks",
    },
    {
      id: "cs-8",
      title: "ML Model Deployment",
      description:
        "Train and deploy a machine learning model with a REST API. Learn about model serving, containerization, and monitoring.",
      difficulty: "Advanced",
      tools: ["Python", "FastAPI", "Docker"],
      estimatedTime: "3 weeks",
    },
  ],
  Finance: [
    {
      id: "fi-1",
      title: "Portfolio Tracker",
      description:
        "Build a real-time portfolio tracking dashboard. Pull live market data and display holdings, P&L, and allocation charts.",
      difficulty: "Beginner",
      tools: ["Python", "Streamlit"],
      estimatedTime: "1 week",
    },
    {
      id: "fi-2",
      title: "Options Pricing Calculator",
      description:
        "Implement Black-Scholes and binomial models for options pricing. Visualize the Greeks and their sensitivity to inputs.",
      difficulty: "Intermediate",
      tools: ["Python", "NumPy"],
      estimatedTime: "2 weeks",
    },
    {
      id: "fi-3",
      title: "Algorithmic Trading Bot",
      description:
        "Backtest and simulate trading strategies. Implement momentum, mean-reversion, or pairs trading strategies with risk management.",
      difficulty: "Advanced",
      tools: ["Python", "pandas", "backtrader"],
      estimatedTime: "4 weeks",
    },
    {
      id: "fi-4",
      title: "Financial News Sentiment",
      description:
        "NLP pipeline for financial news analysis. Classify news sentiment and correlate with stock price movements.",
      difficulty: "Intermediate",
      tools: ["Python", "transformers"],
      estimatedTime: "2-3 weeks",
    },
    {
      id: "fi-5",
      title: "Credit Risk Model",
      description:
        "Build a credit scoring model from loan data. Use logistic regression or gradient boosting to predict default probability.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn"],
      estimatedTime: "2 weeks",
    },
    {
      id: "fi-6",
      title: "DCF Valuation Tool",
      description:
        "Automated discounted cash flow analysis. Pull financial statements and project future cash flows for company valuation.",
      difficulty: "Beginner",
      tools: ["Excel", "Python"],
      estimatedTime: "1 week",
    },
    {
      id: "fi-7",
      title: "Crypto Market Analyzer",
      description:
        "Real-time crypto market data dashboard. Track prices, volumes, and correlations across multiple cryptocurrencies.",
      difficulty: "Intermediate",
      tools: ["Python", "APIs"],
      estimatedTime: "2 weeks",
    },
    {
      id: "fi-8",
      title: "Monte Carlo Simulator",
      description:
        "Portfolio risk simulation engine. Model thousands of scenarios to estimate Value-at-Risk and expected shortfall.",
      difficulty: "Advanced",
      tools: ["Python", "NumPy"],
      estimatedTime: "2 weeks",
    },
  ],
  Marketing: [
    {
      id: "mk-1",
      title: "Social Media Dashboard",
      description:
        "Analytics dashboard for multiple platforms. Aggregate metrics from Instagram, Twitter, and LinkedIn into a unified view.",
      difficulty: "Beginner",
      tools: ["Python", "Streamlit"],
      estimatedTime: "1 week",
    },
    {
      id: "mk-2",
      title: "A/B Test Calculator",
      description:
        "Statistical significance calculator with visualizations. Help marketers determine when they have enough data to call a test.",
      difficulty: "Intermediate",
      tools: ["Python", "scipy"],
      estimatedTime: "1 week",
    },
    {
      id: "mk-3",
      title: "Email Campaign Analyzer",
      description:
        "Open rate and CTR analysis tool. Import campaign data and identify patterns in subject lines, send times, and segments.",
      difficulty: "Beginner",
      tools: ["Python", "pandas"],
      estimatedTime: "1 week",
    },
    {
      id: "mk-4",
      title: "Brand Sentiment Tracker",
      description:
        "Monitor brand mentions and sentiment across social media. Visualize trends and alert on sentiment shifts.",
      difficulty: "Intermediate",
      tools: ["Python", "NLP"],
      estimatedTime: "2 weeks",
    },
    {
      id: "mk-5",
      title: "SEO Audit Tool",
      description:
        "Automated website SEO analysis. Crawl pages and check for meta tags, broken links, page speed, and content quality.",
      difficulty: "Intermediate",
      tools: ["Python", "BeautifulSoup"],
      estimatedTime: "2 weeks",
    },
    {
      id: "mk-6",
      title: "Content Calendar Generator",
      description:
        "AI-powered content planning tool. Generate post ideas, optimal scheduling, and content themes based on audience data.",
      difficulty: "Advanced",
      tools: ["Python", "OpenAI API"],
      estimatedTime: "3 weeks",
    },
    {
      id: "mk-7",
      title: "Customer Segmentation",
      description:
        "Cluster analysis on customer data. Identify distinct customer segments for targeted marketing campaigns.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn"],
      estimatedTime: "2 weeks",
    },
    {
      id: "mk-8",
      title: "Influencer Finder",
      description:
        "Tool to identify relevant influencers by niche. Analyze follower demographics, engagement rates, and content alignment.",
      difficulty: "Advanced",
      tools: ["Python", "APIs"],
      estimatedTime: "3 weeks",
    },
  ],
};

const genericRecommendations: Recommendation[] = [
  {
    id: "gen-1",
    title: "Club Website",
    description:
      "Build a professional website for your club. Include member profiles, event listings, and a project showcase.",
    difficulty: "Beginner",
    tools: ["Next.js", "Tailwind"],
    estimatedTime: "2 weeks",
  },
  {
    id: "gen-2",
    title: "Event Management System",
    description:
      "Digital RSVP and check-in system. Track attendance, send reminders, and collect feedback after events.",
    difficulty: "Intermediate",
    tools: ["Next.js", "Prisma"],
    estimatedTime: "2-3 weeks",
  },
  {
    id: "gen-3",
    title: "Member Directory",
    description:
      "Searchable member profiles with skills, interests, and availability. Help members find collaborators.",
    difficulty: "Beginner",
    tools: ["Next.js", "Prisma"],
    estimatedTime: "1 week",
  },
  {
    id: "gen-4",
    title: "Knowledge Base",
    description:
      "Club wiki with articles and tutorials. Let members contribute and curate learning resources.",
    difficulty: "Intermediate",
    tools: ["Next.js", "MDX"],
    estimatedTime: "2 weeks",
  },
  {
    id: "gen-5",
    title: "Budget Tracker",
    description:
      "Track club finances and expenses. Categorize spending, generate reports, and plan budgets for the semester.",
    difficulty: "Beginner",
    tools: ["Next.js", "Prisma"],
    estimatedTime: "1-2 weeks",
  },
];

// Deterministic shuffle using a seed (Fisher-Yates with seeded random)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Simple LCG for deterministic randomness
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

    // Build pool from domain-specific + generic recommendations
    const pool =
      club.domain && domainRecommendations[club.domain]
        ? [...domainRecommendations[club.domain], ...genericRecommendations]
        : genericRecommendations;

    // Deterministic seed based on club ID + current week number
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const clubSeed = club.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = clubSeed + weekNumber;

    const shuffled = seededShuffle(pool, seed);
    const count = Math.min(shuffled.length, 8);
    const recommendations = shuffled.slice(0, Math.max(count, 5));

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Club recommendations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
