import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Return generated summary report file once backend integration is ready.
  return new NextResponse(null, {
    status: 501,
  });
}
