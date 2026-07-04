import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  manager: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
    description: z.string().optional(),
    manager: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
