import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/mongoose";
import { FileMeta } from "@/models/FileMeta";
import { Client } from "basic-ftp";

async function deleteFromFTP(ftpPath: string) {
  const client = new Client();

  try {
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      secure: false, // Change to true if using FTPS
    });

    await client.remove(ftpPath);
  } catch (err) {
    console.error("FTP deletion error:", err);
    throw new Error("Failed to delete file from FTP server");
  } finally {
    client.close();
  }
}

// Use proper async `params` from context
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string[] } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !(token.id || token.sub)) {
    return NextResponse.json({ id: null, error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id ?? token.sub;
  const [fileId] = context.params.id;

  if (!fileId) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  try {
    await dbConnect();

    const file = await FileMeta.findOne({ _id: fileId, userId });

    if (!file) {
      return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });
    }

    // Delete from FTP
    try {
      await deleteFromFTP(file.path);
    } catch (ftpErr) {
      console.warn("FTP deletion failed, continuing DB delete:", ftpErr);
    }

    // Delete from MongoDB
    await FileMeta.deleteOne({ _id: fileId });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
