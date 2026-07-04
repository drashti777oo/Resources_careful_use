import Employee from '../models/Employee.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employeeValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getEmployeeScopeFilter, canAccessEmployee } from '../utils/access.js';

const buildQuery = (department, status) => {
  const query = {};

  if (department) {
    query.department = department;
  }

  if (status) {
    query.status = status;
  }

  return query;
};

export const createEmployee = async (req, res) => {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid employee data', parsed.error.issues);
    }

    const existingEmployee = await Employee.findOne({ employeeId: parsed.data.employeeId });
    if (existingEmployee) {
      return errorResponse(res, 400, 'Employee already exists');
    }

    const employee = await Employee.create(parsed.data);
    return successResponse(res, 201, 'Employee created successfully', employee);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, status } = req.query;
    const scopeFilter = getEmployeeScopeFilter(req.user);
    const query = { ...buildQuery(department, status), ...scopeFilter };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('user', 'email')
        .populate('manager', 'email')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Employee.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Employees fetched successfully', {
      employees,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await canAccessEmployee(req.user, id)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const employee = await Employee.findById(id)
      .populate('user', 'email role')
      .populate('manager', 'email role');

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    return successResponse(res, 200, 'Employee fetched successfully', employee);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await canAccessEmployee(req.user, id)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid employee data', parsed.error.issues);
    }

    const employee = await Employee.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    return successResponse(res, 200, 'Employee updated successfully', employee);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await canAccessEmployee(req.user, id)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    return successResponse(res, 200, 'Employee deleted successfully', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
