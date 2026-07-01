import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://admissions.bits-pilani.ac.in/FD/FD.html");

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}