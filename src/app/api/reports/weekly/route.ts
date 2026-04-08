import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date();

    // Fetch all active clubs
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { memberships: true } },
      },
    });

    // Fetch activity across all clubs
    const [allPosts, allProjects, allEvents, allNewMembers] = await Promise.all([
      prisma.post.findMany({
        where: { clubId: { not: null }, createdAt: { gte: sevenDaysAgo } },
        include: {
          author: { select: { name: true } },
          club: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: { clubId: { not: null }, createdAt: { gte: sevenDaysAgo } },
        include: {
          author: { select: { name: true } },
          club: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: { clubId: { not: null }, startTime: { gte: now } },
        include: { club: { select: { name: true } } },
        orderBy: { startTime: "asc" },
      }),
      prisma.clubMembership.findMany({
        where: { joinedAt: { gte: sevenDaysAgo } },
        include: {
          user: { select: { name: true } },
          club: { select: { name: true } },
        },
        orderBy: { joinedAt: "desc" },
      }),
    ]);

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    function checkPage(needed: number) {
      if (y + needed > 270) {
        doc.addPage();
        y = 20;
      }
    }

    function drawLine() {
      doc.setDrawColor(197, 164, 78); // Bryant gold
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    }

    // --- HEADER ---
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setTextColor(197, 164, 78);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("Folio", margin, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Weekly Campus Report", margin, 32);

    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const weekStart = new Date(sevenDaysAgo);
    doc.text(
      `${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} — ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      margin,
      40,
    );

    y = 55;

    // --- SUMMARY STATS ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Campus Overview", margin, y);
    y += 10;

    const uniqueMembers = await prisma.clubMembership.groupBy({ by: ["userId"] });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const statsText = [
      `Active Clubs: ${clubs.length}`,
      `Total Members: ${uniqueMembers.length}`,
      `New Posts This Week: ${allPosts.length}`,
      `New Projects This Week: ${allProjects.length}`,
      `New Members This Week: ${allNewMembers.length}`,
      `Upcoming Events: ${allEvents.length}`,
    ];
    for (const line of statsText) {
      doc.text(`•  ${line}`, margin + 2, y);
      y += 6;
    }
    y += 5;
    drawLine();
    y += 3;

    // --- CLUB HIGHLIGHTS ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Club Highlights", margin, y);
    y += 10;

    for (const club of clubs) {
      checkPage(30);

      const clubPosts = allPosts.filter((p) => p.club?.name === club.name);
      const clubProjects = allProjects.filter((p) => p.club?.name === club.name);
      const clubEvents = allEvents.filter((e) => e.club?.name === club.name);
      const clubNewMembers = allNewMembers.filter((m) => m.club?.name === club.name);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 46);
      doc.text(club.name, margin, y);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${club._count.memberships} members  •  ${club.domain || "General"}`,
        margin + doc.getTextWidth(club.name) + 5,
        y,
      );
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      const totalActivity = clubPosts.length + clubProjects.length;
      if (totalActivity > 0) {
        doc.text(
          `${clubPosts.length} new post${clubPosts.length !== 1 ? "s" : ""}, ${clubProjects.length} new project${clubProjects.length !== 1 ? "s" : ""} this week.`,
          margin + 4,
          y,
        );
        y += 5;
      } else {
        doc.text("No new activity this week.", margin + 4, y);
        y += 5;
      }

      if (clubNewMembers.length > 0) {
        const names = clubNewMembers.map((m) => m.user.name).slice(0, 3).join(", ");
        const extra = clubNewMembers.length > 3 ? ` and ${clubNewMembers.length - 3} more` : "";
        doc.text(`New members: ${names}${extra}`, margin + 4, y);
        y += 5;
      }

      if (clubEvents.length > 0) {
        for (const event of clubEvents.slice(0, 2)) {
          doc.text(
            `Upcoming: ${event.title} — ${new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
            margin + 4,
            y,
          );
          y += 5;
        }
      }

      // AI recommendation
      if (totalActivity === 0 && clubEvents.length === 0) {
        doc.setTextColor(197, 164, 78);
        doc.setFont("helvetica", "italic");
        doc.text(
          "Recommendation: Consider hosting an event or starting a project to re-engage members.",
          margin + 4,
          y,
        );
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        y += 5;
      }

      y += 5;
    }

    // --- NEW PROJECTS ---
    if (allProjects.length > 0) {
      checkPage(20);
      drawLine();
      y += 3;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("New Projects This Week", margin, y);
      y += 10;

      for (const project of allProjects.slice(0, 10)) {
        checkPage(12);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 26, 46);
        doc.text(project.title, margin + 4, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(
          `by ${project.author?.name || "Unknown"} in ${project.club?.name || "Unknown Club"}`,
          margin + 4,
          y,
        );
        y += 7;
      }
    }

    // --- UPCOMING EVENTS ---
    if (allEvents.length > 0) {
      checkPage(20);
      drawLine();
      y += 3;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Upcoming Events", margin, y);
      y += 10;

      for (const event of allEvents.slice(0, 10)) {
        checkPage(12);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 26, 46);
        doc.text(event.title, margin + 4, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        const dateStr = new Date(event.startTime).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        doc.text(
          `${dateStr}${event.location ? ` — ${event.location}` : ""} (${event.club?.name})`,
          margin + 4,
          y,
        );
        y += 7;
      }
    }

    // --- FOOTER ---
    checkPage(20);
    y += 5;
    drawLine();
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by Folio AI on ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      margin,
      y,
    );
    y += 4;
    doc.text("Folio — One Platform for Every Club on Campus • Bryant University", margin, y);

    // Return PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="folio-weekly-report-${now.toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Weekly report PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
