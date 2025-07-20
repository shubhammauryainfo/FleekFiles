import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (id === "all") {
      const allFiles = await FileMeta.find().sort({ uploadedAt: -1 });
      return NextResponse.json({ files: allFiles });
    }
    
    // Find a single file by its _id
    const file = await FileMeta.findById(id);
    
    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      file: file,
    });
  } catch (error) {
    console.error("Error fetching file meta:", error);
    return NextResponse.json(
      { error: "Failed to fetch file metadata" },
      { status: 500 }
    );
  }
}