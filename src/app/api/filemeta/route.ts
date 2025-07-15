// src/app/api/filemeta/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { FileMeta } from '@/models/FileMeta';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const files = await FileMeta.find().sort({ uploadedAt: -1 });

    return NextResponse.json({
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('Error fetching all file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file metadata' },
      { status: 500 }
    );
  }
}
