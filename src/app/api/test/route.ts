import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const update = await prisma.update.create({
    data: {
      notice: "Hello from Prisma",
    },
  });

  return NextResponse.json(update);
}