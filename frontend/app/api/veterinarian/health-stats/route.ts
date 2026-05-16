import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Replace with real service call and return VetHealthStat[].
  return NextResponse.json(
    { message: "TODO: Implement veterinarian health-stats endpoint" },
    { status: 501 },
  );
}
