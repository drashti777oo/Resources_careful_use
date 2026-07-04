import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { applyLeaveSchema, updateLeaveSchema } from '../validators/leaveValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const calculateTotalDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

export const applyLeave = async (req, res) => {
  try {
    const parsed = applyLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid leave application data', parsed.error.issues);
    }

    const { employee, leaveType, startDate, endDate, reason } = parsed.data;
    const employeeRecord = await Employee.findById(employee);
    if (!employeeRecord) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const totalDays = calculateTotalDays(startDate, endDate);
    const leave = await Leave.create({
      employee,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || '',
      totalDays,
      status: 'Pending',
    });

    return successResponse(res, 201, 'Leave applied successfully', leave);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return errorResponse(res, 404, 'Employee record not found');
    }

    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'My leaves fetched successfully', leaves);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { page = 1, limit = 20, search, status, leaveType, date } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    if (date) {
      const target = new Date(date);
      query.startDate = { $lte: target };
      query.endDate = { $gte: target };
    }

    if (search) {
      const employees = await Employee.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.employee = { $in: employees.map((emp) => emp._id) };
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate('employee', 'firstName lastName department')
        .populate('approvedBy', 'name email role')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Leave.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Leaves fetched successfully', {
      leaves,
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

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id)
      .populate('employee', 'firstName lastName department')
      .populate('approvedBy', 'name email role');

    if (!leave) {
      return errorResponse(res, 404, 'Leave not found');
    }

    if (!['Admin', 'HR'].includes(req.user.role)) {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee || employee._id.toString() !== leave.employee._id.toString()) {
        return errorResponse(res, 403, 'Access denied');
      }
    }

    return successResponse(res, 200, 'Leave fetched successfully', leave);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const approveLeave = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) {
      return errorResponse(res, 404, 'Leave not found');
    }

    leave.status = 'Approved';
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    return successResponse(res, 200, 'Leave approved successfully', leave);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const rejectLeave = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const { comments } = req.body;
    const leave = await Leave.findById(id);
    if (!leave) {
      return errorResponse(res, 404, 'Leave not found');
    }

    leave.status = 'Rejected';
    leave.comments = comments || leave.comments;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    return successResponse(res, 200, 'Leave rejected successfully', leave);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) {
      return errorResponse(res, 404, 'Leave not found');
    }

    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee || employee._id.toString() !== leave.employee.toString()) {
      return errorResponse(res, 403, 'Access denied');
    }

    leave.status = 'Cancelled';
    leave.comments = 'Cancelled by employee';
    await leave.save();

    return successResponse(res, 200, 'Leave cancelled successfully', leave);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deleteLeave = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const leave = await Leave.findByIdAndDelete(id);
    if (!leave) {
      return errorResponse(res, 404, 'Leave not found');
    }

    return successResponse(res, 200, 'Leave deleted successfully', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
