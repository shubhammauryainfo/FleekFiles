import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { LoginLog } from "@/models/LoginLog";

// GET all login logs
export async function GET() {
  try {
    await dbConnect();
    const logs = await LoginLog.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Failed to fetch login logs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch login logs" 
    }, { status: 500 });
  }
}