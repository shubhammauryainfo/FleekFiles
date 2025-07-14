// src/app/api/login-logs/[userId]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { LoginLog } from "@/models/LoginLog";
import mongoose from "mongoose";

// GET logs by user ID
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect();
    
    // Await params before accessing properties
    const { userId } = await params;
    
    // Validate userId format
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid userID format" 
      }, { status: 400 });
    }
    
    const logs = await LoginLog.find({ userId: userId }).sort({ createdAt: -1 });
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
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect();
    
    // Await params before accessing properties
    const { userId } = await params;
    
    // Validate userId format
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    const result = await LoginLog.deleteMany({ userId: userId });
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