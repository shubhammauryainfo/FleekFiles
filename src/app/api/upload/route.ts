import { NextRequest, NextResponse } from "next/server";
import { connectFTP } from "@/lib/ftpClient";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";
import { Readable } from "stream";
import path from "path";


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

  const now = new Date();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeSuffix = `${minutes}${seconds}`;
  
  const originalName = path.parse(file.name).name;
  const extension = path.parse(file.name).ext;
  
  const newFilename = `${originalName}${timeSuffix}${extension}`;

  const ftpClient = await connectFTP();
  const filePath = `/htdocs/fleekfiles/${newFilename}`;

  await ftpClient.ensureDir('/htdocs/fleekfiles');
  await ftpClient.uploadFrom(stream, filePath);
  ftpClient.close();

  await dbConnect();

  // Use Mongoose model to save metadata with new filename
  await FileMeta.create({
    filename: newFilename,
    originalFilename: file.name,
    path: filePath,
    userId,
    uploadedAt: new Date(),
    size: buffer.length,
  });

  return NextResponse.json({ 
    success: true, 
    path: filePath,
    filename: newFilename,
    originalFilename: file.name
  });
}