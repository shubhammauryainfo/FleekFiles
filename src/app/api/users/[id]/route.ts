import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { User } from "@/models/User";
import { FileMeta } from "@/models/FileMeta";
import { LoginLog } from "@/models/LoginLog";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching user", error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        await FileMeta.deleteMany({ userId: id }).session(session);
        await LoginLog.deleteMany({ userId: id }).session(session);
        await User.findByIdAndDelete(id).session(session);
      });
      
      return NextResponse.json({ 
        message: "User and all related data deleted successfully" 
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return NextResponse.json({ message: "Error deleting user", error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;

  try {
    const data = await request.json();
    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: "Error updating user", error }, { status: 500 });
  }
}