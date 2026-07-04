import { Schema, model, type Document, type Types } from "mongoose";

export interface IPayroll extends Document {
  employee: Types.ObjectId;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "draft" | "processed" | "paid";
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 2000 },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "processed", "paid"],
      default: "draft",
    },
    paymentDate: { type: Date, default: null },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = model<IPayroll>("Payroll", payrollSchema);
