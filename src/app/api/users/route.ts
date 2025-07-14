import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";


export async function GET() {
  try {
    await dbConnect();
    const users = await User.find().select("-password");
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch users" 
    }, { status: 500 });
  }
}