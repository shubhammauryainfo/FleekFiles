// src/models/FileMeta.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IFileMeta extends Document {
  filename: string;
  path: string;
  userId: string;
  uploadedAt: Date;
  size: number;
}

const FileMetaSchema = new Schema<IFileMeta>({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  userId: { type: String, required: true },
  uploadedAt: { type: Date, required: true, default: Date.now },
  size: { type: Number, required: true },
});

export const FileMeta = models.FileMeta || model<IFileMeta>("FileMeta", FileMetaSchema);
