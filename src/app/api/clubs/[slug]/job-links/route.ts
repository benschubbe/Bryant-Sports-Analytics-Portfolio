import { NextRequest, NextResponse } from "next/server";
import { getClubBySlug } from "@/lib/club";

// Domain-specific search terms and role types
const DOMAIN_CONFIG: Record<string, { searchTerms: string[]; roleTypes: string[] }> = {
  "Sports Analytics": {
    searchTerms: [
      "sports analyst intern",
      "sports data analyst",
      "baseball operations analyst",
      "basketball analytics",
      "NFL data science",
    ],
    roleTypes: ["Analyst", "Data Scientist", "Research Assistant", "Scout", "Operations Analyst"],
  },
  "Computer Science": {
    searchTerms: [
      "software engineer intern",
      "full stack developer",
      "backend engineer",
      "frontend developer",
      "devops engineer",
    ],
    roleTypes: ["Software Engineer", "Full Stack Developer", "Backend Engineer", "Frontend Developer", "DevOps Engineer"],
  },
  Finance: {
    searchTerms: [
      "financial analyst intern",
      "investment banking analyst",
      "equity research",
      "risk analyst",
      "quantitative analyst",
    ],
    roleTypes: ["Financial Analyst", "Investment Banking Analyst", "Risk Analyst", "Quantitative Analyst", "Portfolio Analyst"],
  },
  Marketing: {
    searchTerms: [
      "marketing analyst intern",
      "digital marketing",
      "social media manager",
      "brand strategist",
      "content marketing",
    ],
    roleTypes: ["Marketing Analyst", "Digital Marketer", "Social Media Manager", "Brand Strategist", "Content Marketer"],
  },
  "Data Science": {
    searchTerms: [
      "data scientist intern",
      "machine learning engineer",
      "data analyst",
      "business intelligence analyst",
      "data engineer",
    ],
    roleTypes: ["Data Scientist", "ML Engineer", "Data Analyst", "BI Analyst", "Data Engineer"],
  },
  Accounting: {
    searchTerms: [
      "accounting intern",
      "staff accountant",
      "audit associate",
      "tax analyst",
      "forensic accountant",
    ],
    roleTypes: ["Staff Accountant", "Audit Associate", "Tax Analyst", "Forensic Accountant", "Financial Reporting Analyst"],
  },
  Economics: {
    searchTerms: [
      "economics research assistant",
      "economic analyst intern",
      "policy analyst",
      "market research analyst",
      "econometrics analyst",
    ],
    roleTypes: ["Economic Analyst", "Research Assistant", "Policy Analyst", "Market Researcher", "Econometrician"],
  },
  "Information Systems": {
    searchTerms: [
      "IT analyst intern",
      "systems analyst",
      "business analyst",
      "ERP consultant",
      "information security analyst",
    ],
    roleTypes: ["Systems Analyst", "Business Analyst", "IT Consultant", "ERP Specialist", "Security Analyst"],
  },
  Cybersecurity: {
    searchTerms: [
      "cybersecurity analyst intern",
      "security operations analyst",
      "penetration tester",
      "information security",
      "SOC analyst",
    ],
    roleTypes: ["Security Analyst", "Penetration Tester", "SOC Analyst", "Security Engineer", "GRC Analyst"],
  },
  Management: {
    searchTerms: [
      "management trainee",
      "business operations intern",
      "project coordinator",
      "operations analyst",
      "management consultant",
    ],
    roleTypes: ["Management Trainee", "Operations Analyst", "Project Coordinator", "Business Analyst", "Consultant"],
  },
  Entrepreneurship: {
    searchTerms: [
      "startup intern",
      "business development associate",
      "venture capital analyst",
      "product manager intern",
      "growth analyst",
    ],
    roleTypes: ["Business Development", "Product Manager", "Growth Analyst", "Venture Capital Analyst", "Startup Associate"],
  },
};

const DEFAULT_CONFIG = {
  searchTerms: [
    "analyst intern",
    "project coordinator",
    "research assistant",
  ],
  roleTypes: ["Analyst", "Coordinator", "Research Assistant"],
};

function buildSearchLinks(keywords: string) {
  const encoded = encodeURIComponent(keywords);
  return [
    {
      platform: "LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?keywords=${encoded}`,
      icon: "linkedin",
    },
    {
      platform: "Indeed",
      url: `https://www.indeed.com/jobs?q=${encoded}`,
      icon: "indeed",
    },
    {
      platform: "Handshake",
      url: `https://app.joinhandshake.com/stu/postings?search=${encoded}`,
      icon: "handshake",
    },
  ];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const club = await getClubBySlug(slug);

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const domain = club.domain || "";
    const config = DOMAIN_CONFIG[domain] || DEFAULT_CONFIG;

    // Build search links using the first search term as the primary keyword
    const primaryKeyword = config.searchTerms[0] || "intern";
    const searchLinks = buildSearchLinks(primaryKeyword);

    return NextResponse.json({
      searchLinks,
      suggestedSearchTerms: config.searchTerms,
      roleTypes: config.roleTypes,
      domain: domain || "General",
    });
  } catch (error) {
    console.error("Job links GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
