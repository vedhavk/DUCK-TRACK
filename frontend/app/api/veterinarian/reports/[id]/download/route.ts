import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await context.params;

  // TODO: Return generated report file once backend integration is ready.
  return new NextResponse(null, {
    status: 501,
  });
}
