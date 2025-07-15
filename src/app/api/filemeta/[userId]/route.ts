import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    
    
    const { userId } = await params;
    
    if (userId === "all") {
      const allFiles = await FileMeta.find().sort({ uploadedAt: -1 });
      return NextResponse.json({ files: allFiles });
    }
    
    const userFiles = await FileMeta.find({ userId }).sort({ uploadedAt: -1 });
    const totalSizeBytes = userFiles.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024) * 100) / 100;

    return NextResponse.json({
      userId,
      totalSize: totalSizeMB,
      totalSizeUnit: "MB",
      count: userFiles.length,
      files: userFiles,
    });
  } catch (error) {
    console.error("Error fetching file meta:", error);
    return NextResponse.json(
      { error: "Failed to fetch file metadata" },
      { status: 500 }
    );
  }
}