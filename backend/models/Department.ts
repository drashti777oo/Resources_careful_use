import { Schema, model, type Document, type Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  head?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true, default: null },
    head: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department = model<IDepartment>("Department", departmentSchema);
