import { Schema, model, type Document, type Types } from "mongoose";

export interface ILeaveRequest extends Document {
  employee: Types.ObjectId;
  leaveType: "annual" | "sick" | "maternity" | "paternity" | "unpaid";
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    leaveType: {
      type: String,
      enum: ["annual", "sick", "maternity", "paternity", "unpaid"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    daysRequested: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const LeaveRequest = model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
