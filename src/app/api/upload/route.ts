import { NextRequest, NextResponse } from "next/server";
import { connectFTP } from "@/lib/ftpClient";
import clientPromise from "@/lib/mongo";
import { FileMeta } from "@/models/FileMeta";
import { Readable } from "stream"; // ✅ Import Readable

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;
  const userId = data.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json({ error: "Missing file or user ID" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer); // ✅ Convert Buffer to Readable stream

  const ftpClient = await connectFTP();
  const filePath = `/uploads/${file.name}`;

  await ftpClient.ensureDir("/uploads");
  await ftpClient.uploadFrom(stream, filePath); // ✅ Upload using stream
  ftpClient.close();

  const mongoClient = await clientPromise;
  const db = mongoClient.db();
  const files = db.collection<FileMeta>("files");

  await files.insertOne({
    filename: file.name,
    path: filePath,
    userId,
    uploadedAt: new Date(),
    size: buffer.length,
  });

  return NextResponse.json({ success: true, path: filePath });
}
