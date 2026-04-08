import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Smart candidate matching from natural language job descriptions
// Extracts skills/tools keywords and finds students with matching projects

const SKILL_KEYWORDS: Record<string, string[]> = {
  // Programming
  python: ["Python", "pandas", "NumPy", "scikit-learn", "matplotlib", "Django", "Flask", "FastAPI"],
  javascript: ["JavaScript", "TypeScript", "Node.js", "React", "Next.js", "Vue", "Angular"],
  sql: ["SQL", "PostgreSQL", "MySQL", "SQLite", "database"],
  r: ["R", "RStudio", "ggplot2", "tidyverse"],
  java: ["Java", "Spring"],
  rust: ["Rust"],
  go: ["Go", "Golang"],

  // Data & Analytics
  "data analysis": ["Python", "pandas", "SQL", "Excel", "data", "analytics"],
  "data science": ["Python", "scikit-learn", "machine learning", "ML", "data science", "statistics"],
  "data visualization": ["Tableau", "Power BI", "matplotlib", "D3.js", "visualization", "dashboard"],
  "machine learning": ["Python", "scikit-learn", "TensorFlow", "PyTorch", "ML", "machine learning", "XGBoost"],
  statistics: ["R", "Python", "statistics", "regression", "hypothesis"],
  tableau: ["Tableau"],
  excel: ["Excel", "spreadsheet", "VBA"],
  "power bi": ["Power BI"],

  // Finance
  "financial modeling": ["Excel", "financial modeling", "DCF", "valuation"],
  "financial analysis": ["Excel", "finance", "financial", "accounting", "Bloomberg"],
  trading: ["Python", "trading", "algorithmic", "backtrader", "quantitative"],
  "risk management": ["risk", "VaR", "Monte Carlo", "simulation"],
  accounting: ["Excel", "accounting", "audit", "financial statements"],
  bloomberg: ["Bloomberg", "terminal"],

  // Marketing
  "digital marketing": ["marketing", "SEO", "social media", "Google Analytics", "content"],
  seo: ["SEO", "Google Analytics", "search engine"],
  "social media": ["social media", "Instagram", "Twitter", "LinkedIn", "content"],
  "market research": ["research", "survey", "analytics", "consumer"],
  branding: ["brand", "marketing", "design", "creative"],

  // Web & Software
  "web development": ["React", "Next.js", "HTML", "CSS", "JavaScript", "TypeScript", "web"],
  "full stack": ["React", "Node.js", "PostgreSQL", "API", "full stack"],
  "front end": ["React", "CSS", "HTML", "JavaScript", "UI", "frontend"],
  "back end": ["Node.js", "Python", "API", "database", "backend"],
  api: ["API", "REST", "GraphQL"],
  mobile: ["React Native", "Flutter", "iOS", "Android", "mobile"],

  // Sports
  "sports analytics": ["sports", "ESPN", "basketball", "football", "baseball", "analytics", "prediction"],
  sabermetrics: ["baseball", "sabermetrics", "WAR", "sports"],

  // General
  research: ["research", "analysis", "report"],
  presentation: ["PowerPoint", "presentation", "communication"],
  project: ["project management", "Agile", "Scrum"],
  nlp: ["NLP", "natural language", "text analysis", "sentiment"],
};

function extractSkills(description: string): string[] {
  const lower = description.toLowerCase();
  const matchedTools = new Set<string>();

  // Check each keyword category
  for (const [keyword, tools] of Object.entries(SKILL_KEYWORDS)) {
    if (lower.includes(keyword)) {
      tools.forEach((t) => matchedTools.add(t));
    }
  }

  // Also check for direct tool mentions
  const directTools = [
    "Python", "R", "SQL", "Tableau", "Excel", "JavaScript", "TypeScript",
    "React", "Next.js", "Node.js", "PostgreSQL", "MongoDB", "Docker",
    "AWS", "Git", "Figma", "Photoshop", "Power BI", "MATLAB", "SAS",
    "Stata", "SPSS", "Bloomberg", "VBA",
  ];
  for (const tool of directTools) {
    if (lower.includes(tool.toLowerCase())) {
      matchedTools.add(tool);
    }
  }

  return [...matchedTools];
}

function generateSearchSummary(description: string, skills: string[], candidateCount: number): string {
  if (skills.length === 0) {
    return "We couldn't identify specific technical skills from your description. Try mentioning tools, programming languages, or specific skills you're looking for.";
  }

  const skillList = skills.slice(0, 8).join(", ");
  if (candidateCount === 0) {
    return `We identified skills in ${skillList} from your description, but no students currently have matching projects. As more students build projects on Folio, matches will appear.`;
  }

  return `Based on your description, we identified expertise in ${skillList} and found ${candidateCount} student${candidateCount !== 1 ? "s" : ""} with relevant project experience.`;
}

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed description (at least 10 characters)." },
        { status: 400 },
      );
    }

    // Extract skills from the description
    const extractedSkills = extractSkills(description);

    if (extractedSkills.length === 0) {
      return NextResponse.json({
        skills: [],
        candidates: [],
        summary: generateSearchSummary(description, [], 0),
      });
    }

    // Find projects matching any of the extracted skills
    const matchingProjects = await prisma.project.findMany({
      where: {
        visibility: "PUBLIC",
        OR: extractedSkills.map((skill) => ({
          tools: { contains: skill, mode: "insensitive" as const },
        })),
      },
      select: { authorId: true, tools: true },
    });

    const userIds = [...new Set(matchingProjects.map((p) => p.authorId))];

    if (userIds.length === 0) {
      return NextResponse.json({
        skills: extractedSkills,
        candidates: [],
        summary: generateSearchSummary(description, extractedSkills, 0),
      });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        concentration: true,
        classYear: true,
        projects: {
          where: { visibility: "PUBLIC" },
          select: { id: true, title: true, tools: true, abstract: true, views: true },
        },
        memberships: {
          select: { club: { select: { name: true } } },
        },
      },
      take: 20,
    });

    // Score and rank candidates by relevance
    const candidates = users.map((user) => {
      const allTools = new Set<string>();
      let relevanceScore = 0;
      const relevantProjects: { title: string; abstract: string | null; tools: string[] }[] = [];

      for (const project of user.projects) {
        let projectTools: string[] = [];
        try {
          const parsed = JSON.parse(project.tools);
          if (Array.isArray(parsed)) projectTools = parsed;
        } catch {
          // skip
        }
        projectTools.forEach((t) => allTools.add(t));

        // Score: how many extracted skills match this project's tools
        const matches = extractedSkills.filter((s) =>
          projectTools.some((t) => t.toLowerCase().includes(s.toLowerCase())),
        ).length;
        if (matches > 0) {
          relevanceScore += matches;
          relevantProjects.push({
            title: project.title,
            abstract: project.abstract,
            tools: projectTools,
          });
        }
      }

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        headline: user.headline,
        concentration: user.concentration,
        classYear: user.classYear,
        projectCount: user.projects.length,
        tools: [...allTools],
        clubs: user.memberships.map((m) => m.club.name),
        relevanceScore,
        relevantProjects: relevantProjects.slice(0, 3),
      };
    });

    // Sort by relevance score descending
    candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      skills: extractedSkills,
      candidates,
      summary: generateSearchSummary(description, extractedSkills, candidates.length),
    });
  } catch (error) {
    console.error("Employer match POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
