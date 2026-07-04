import { Schema, model, type Document, type Types } from "mongoose";

export interface IAttendance extends Document {
  employee: Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "late" | "half-day";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: Date, required: true, index: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
    },
    notes: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
