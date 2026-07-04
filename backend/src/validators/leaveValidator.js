import { z } from 'zod';

export const applyLeaveSchema = z
  .object({
    employee: z.string().min(1, 'Employee ID is required'),
    leaveType: z.enum(['Paid', 'Sick', 'Casual', 'Unpaid']),
    startDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date'),
    endDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date'),
    reason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = Date.parse(data.startDate);
      const end = Date.parse(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be the same as or later than the start date',
          path: ['endDate'],
        });
      }
    }
  });

export const updateLeaveSchema = z
  .object({
    leaveType: z.enum(['Paid', 'Sick', 'Casual', 'Unpaid']).optional(),
    startDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date').optional(),
    endDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date').optional(),
    reason: z.string().optional(),
    comments: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = Date.parse(data.startDate);
      const end = Date.parse(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be the same as or later than the start date',
          path: ['endDate'],
        });
      }
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
