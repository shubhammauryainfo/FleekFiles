import { NextRequest, NextResponse } from "next/server";
import { connectFTP } from "@/lib/ftpClient";
import { Writable } from "stream";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ path?: string[] }> }
) {
  // Await the params object
  const resolvedParams = await params;

  if (!resolvedParams?.path || resolvedParams.path.length === 0) {
    return NextResponse.json({ error: "No file path specified." }, { status: 400 });
  }

  const filePath = "/" + resolvedParams.path.join("/");

  const ftpClient = await connectFTP();
  const chunks: Buffer[] = [];

  const writable = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  try {
    await ftpClient.downloadTo(writable, filePath);
    ftpClient.close();

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${resolvedParams.path.at(-1)}"`,
      },
    });
  } catch (err) {
    ftpClient.close();
    return NextResponse.json({ error: "File not found or download failed" }, { status: 404 });
  }
}