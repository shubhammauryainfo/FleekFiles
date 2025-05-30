import { NextRequest, NextResponse } from "next/server";
import { connectFTP } from "@/lib/ftpClient";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;
  const userId = data.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json({ error: "Missing file or user ID" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  const ftpClient = await connectFTP();
  const filePath = `/fleekfiles/${file.name}`;

  await ftpClient.ensureDir("/fleekfiles");
  await ftpClient.uploadFrom(stream, filePath);
  ftpClient.close();

  await dbConnect();

  // Use Mongoose model to save metadata
  await FileMeta.create({
    filename: file.name,
    path: filePath,
    userId,
    uploadedAt: new Date(),
    size: buffer.length,
  });

  return NextResponse.json({ success: true, path: filePath });
}
