import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Feedback } from "@/models/Feedback";

// POST: Add feedback
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !subject || !message || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const feedback = await Feedback.create({ name, phone, email, subject, message });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("POST Feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: All feedback entries
export async function GET() {
  try {
    await dbConnect();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("GET Feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
