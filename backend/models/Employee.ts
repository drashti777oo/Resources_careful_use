import { Schema, model, type Document, type Types } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: Types.ObjectId;
  jobTitle: string;
  hireDate: Date;
  employmentType: "full-time" | "part-time" | "contract";
  status: "active" | "inactive" | "on-leave";
  manager?: Types.ObjectId;
  salary?: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true, default: null },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    jobTitle: { type: String, required: true, trim: true },
    hireDate: { type: Date, required: true, default: Date.now },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      default: "full-time",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
    manager: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    salary: { type: Number, min: 0, default: null },
    address: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
