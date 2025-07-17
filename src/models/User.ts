import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  provider?: string;
  role?: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    phone: { type: String },
    provider: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true, 
  }
);

export const User = models.User || model<IUser>("User", UserSchema);
