import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ILoginLog extends Document {
  email: string;
  userId: string;
  provider: string;
  ip: string;
  device: string;
  timestamp: Date;
}

const LoginLogSchema = new Schema<ILoginLog>({
  email: { type: String, required: true },
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  ip: { type: String, required: true },
  device: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const LoginLog = models.LoginLog || model<ILoginLog>("LoginLog", LoginLogSchema);
