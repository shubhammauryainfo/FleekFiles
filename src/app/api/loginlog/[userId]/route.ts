// src/app/api/login-logs/[userId]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { LoginLog } from "@/models/LoginLog";
import mongoose from "mongoose";

// GET logs by user ID
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    await dbConnect();
    
    // Validate userId format
    if (!params.userId || !mongoose.Types.ObjectId.isValid(params.userId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid userID format" 
      }, { status: 400 });
    }
    
    const logs = await LoginLog.find({ userId: params.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Failed to fetch user logs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch user logs" 
    }, { status: 500 });
  }
}

// DELETE logs by user ID
export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    await dbConnect();
    
    // Validate userId format
    if (!params.userId || !mongoose.Types.ObjectId.isValid(params.userId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    const result = await LoginLog.deleteMany({ userId: params.userId });
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} log(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Failed to delete user logs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to delete user logs" 
    }, { status: 500 });
  }
}