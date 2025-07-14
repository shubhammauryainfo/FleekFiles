import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";

// Get user by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Await the params Promise
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

// Delete user by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Await the params Promise
  const { id } = await params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting user", error }, { status: 500 });
  }
}

// Update user by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Await the params Promise
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