import Department from '../models/Department.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createDepartment = async (req, res) => {
  try {
    const parsed = createDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid department data', parsed.error.issues);
    }

    const existing = await Department.findOne({ name: parsed.data.name });
    if (existing) {
      return errorResponse(res, 400, 'Department already exists');
    }

    const department = await Department.create(parsed.data);
    return successResponse(res, 201, 'Department created successfully', department);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('manager', 'email name role')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Department.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Departments fetched successfully', {
      departments,
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

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate('manager', 'email name role');

    if (!department) {
      return errorResponse(res, 404, 'Department not found');
    }

    return successResponse(res, 200, 'Department fetched successfully', department);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const parsed = updateDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid department data', parsed.error.issues);
    }

    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).populate('manager', 'email name role');

    if (!department) {
      return errorResponse(res, 404, 'Department not found');
    }

    return successResponse(res, 200, 'Department updated successfully', department);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return errorResponse(res, 404, 'Department not found');
    }

    return successResponse(res, 200, 'Department deleted successfully', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
