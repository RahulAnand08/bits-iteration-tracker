import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh;
    const auth = subscription.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription" },
        { status: 400 }
      );
    }

    await prisma.subscriber.upsert({
      where: {
        endpoint,
      },
      update: {
        p256dh,
        auth,
      },
      create: {
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}