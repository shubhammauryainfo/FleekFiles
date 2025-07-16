import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Feedback } from "@/models/Feedback";

// GET /api/feedback/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching feedback" }, { status: 500 });
  }
}

// PUT /api/feedback/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updated = await Feedback.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating feedback" }, { status: 500 });
  }
}

// DELETE /api/feedback/:id
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Feedback deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting feedback" }, { status: 500 });
  }
}