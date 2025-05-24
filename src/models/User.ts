// src/models/User.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

// Define a TypeScript interface for the user
export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  provider?: string;
}

// Define the Mongoose schema
const UserSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  provider: String,
});

// Export the Mongoose model
export const User = models.User || model<IUser>("User", UserSchema);
