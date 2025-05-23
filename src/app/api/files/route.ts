import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { FileMeta } from "@/models/FileMeta";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const files = db.collection<FileMeta>("files");

  const allFiles = await files
    .find({})
    .sort({ uploadedAt: -1 }) // newest first
    .toArray();

  return NextResponse.json(allFiles);
}
