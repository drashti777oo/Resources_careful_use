import { z } from 'zod';

export const generatePayrollSchema = z
  .object({
    employee: z.string().min(1, 'Employee ID is required'),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1900),
    basicSalary: z.number().nonnegative(),
    allowances: z.number().nonnegative().optional(),
    bonus: z.number().nonnegative().optional(),
    deductions: z.number().nonnegative().optional(),
    tax: z.number().nonnegative().optional(),
    remarks: z.string().optional(),
  })
  .refine((data) => data.basicSalary >= 0, {
    message: 'Basic salary must be provided and non-negative',
    path: ['basicSalary'],
  });

export const updatePayrollSchema = z
  .object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).optional(),
    basicSalary: z.number().nonnegative().optional(),
    allowances: z.number().nonnegative().optional(),
    bonus: z.number().nonnegative().optional(),
    deductions: z.number().nonnegative().optional(),
    tax: z.number().nonnegative().optional(),
    paymentStatus: z.enum(['Pending', 'Paid']).optional(),
    paymentDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid payment date').optional(),
    remarks: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
