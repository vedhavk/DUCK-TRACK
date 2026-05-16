import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Replace with real service call and return MedicalReport[].
  return NextResponse.json(
    { message: "TODO: Implement veterinarian reports endpoint" },
    { status: 501 },
  );
}
