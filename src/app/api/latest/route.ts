import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const latest = await prisma.update.findFirst({
    orderBy: {
      scrapedAt: "desc",
    },
  });

  return NextResponse.json(latest);
}