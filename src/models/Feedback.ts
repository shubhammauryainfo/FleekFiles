import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Feedback =
  models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
