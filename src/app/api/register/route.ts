import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose"; // <-- import your mongoose connection
import { User, IUser } from "@/models/User";
import bcrypt from "bcryptjs";

interface RegisterRequestBody {
  name?: string;
  email: string;
  password: string;
  phone?: string;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = (await req.json()) as RegisterRequestBody;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect(); // <-- await mongoose connection here

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: Partial<IUser> = {
      name,
      email,
      password: hashedPassword,
      phone,
      provider: "credentials",
    };

    await User.create(newUser);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
