import { z } from 'zod';

export const checkInSchema = z.object({
  employee: z.string().min(1, 'Employee ID is required'),
  date: z.string().optional(),
  remarks: z.string().optional(),
});

export const checkOutSchema = z.object({
  employee: z.string().min(1, 'Employee ID is required'),
  date: z.string().optional(),
  remarks: z.string().optional(),
});

export const attendanceUpdateSchema = z
  .object({
    employee: z.string().optional(),
    date: z.string().optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    status: z.enum(['Present', 'Absent', 'Half-Day', 'Leave', 'Late']).optional(),
    workingHours: z.number().optional(),
    remarks: z.string().optional(),
    markedBy: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
