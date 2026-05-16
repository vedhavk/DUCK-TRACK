import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Replace with real service call and return DetectionImage[].
  return NextResponse.json(
    { message: "TODO: Implement veterinarian detections endpoint" },
    { status: 501 },
  );
}
