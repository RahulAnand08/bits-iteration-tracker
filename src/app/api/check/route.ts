import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLatestNotice } from "@/lib/scraper";
import { sendNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const latestNotice = await getLatestNotice();

    const latest = await prisma.update.findFirst({
      orderBy: {
        scrapedAt: "desc",
      },
    });

    // First run - seed the database without sending notifications
    if (!latest) {
      await prisma.update.create({
        data: {
          notice: latestNotice,
        },
      });

      return NextResponse.json({
        success: true,
        changed: false,
        firstRun: true,
        latestNotice,
      });
    }

    // No change detected
    if (latest.notice === latestNotice) {
      return NextResponse.json({
        success: true,
        changed: false,
        latestNotice,
      });
    }

    // Notice changed
    await prisma.update.create({
      data: {
        notice: latestNotice,
      },
    });

    // Send push notification to all subscribers
    await sendNotification(
      "BITS Admissions Update. Tap to open tracker.",
      `Latest Update:\n\n${latestNotice}`
    );

    return NextResponse.json({
      success: true,
      changed: true,
      previous: latest.notice,
      latestNotice,
      notificationSent: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}