import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "FTL Coins",
    status: "online",
    time: new Date().toISOString()
  });
}
