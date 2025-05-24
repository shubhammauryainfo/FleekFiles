import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";

export async function GET() {
  await dbConnect();

  const allFiles = await FileMeta.find({})
    .sort({ uploadedAt: -1 })
    .lean();

  return NextResponse.json(allFiles);
}
