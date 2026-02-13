import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekEnd: string; topicId: string }> }
) {
  const { weekEnd, topicId } = await params;

  try {
    const res = await fetch(
      `${API_BASE}/share/weekly/${weekEnd}/${topicId}/og`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!res.ok) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("OG image generation failed", { status: 500 });
  }
}