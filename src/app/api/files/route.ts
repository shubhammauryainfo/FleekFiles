import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userFiles = await FileMeta.find({ userId })
      .sort({ uploadedAt: -1 })
      .lean();

    return NextResponse.json(userFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
