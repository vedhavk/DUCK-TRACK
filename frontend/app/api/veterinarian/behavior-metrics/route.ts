import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Replace with real service call and return BehaviorMetric[].
  return NextResponse.json(
    { message: "TODO: Implement veterinarian behavior-metrics endpoint" },
    { status: 501 },
  );
}
