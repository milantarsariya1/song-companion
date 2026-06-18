import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    // Call the public LRCLIB search endpoint
    // It's recommended to send a descriptive User-Agent header
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "LyrindAICompanion/1.0.0 (https://github.com/milantarsariya1/Lyrind)"
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LRCLIB search failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in lyrics proxy search route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
