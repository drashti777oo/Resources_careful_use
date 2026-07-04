import { Schema, model, type Document, type Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "manager" | "employee";
  department?: Types.ObjectId;
  employee?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    department: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
