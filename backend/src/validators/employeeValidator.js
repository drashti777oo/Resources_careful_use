import { z } from 'zod';

const baseEmployeeShape = {
  employeeId: z.string().min(1, 'Employee ID is required'),
  user: z.string().min(1, 'User ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.number().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  profilePicture: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Terminated']).optional(),
  manager: z.string().optional(),
};

export const createEmployeeSchema = z.object({
  ...baseEmployeeShape,
});

export const updateEmployeeSchema = z
  .object({
    ...baseEmployeeShape,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
