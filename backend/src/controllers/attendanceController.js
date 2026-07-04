import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { checkInSchema, checkOutSchema, attendanceUpdateSchema } from '../validators/attendanceValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const checkIn = async (req, res) => {
  try {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid check-in data', parsed.error.errors);
    }

    const { employee, remarks } = parsed.data;
    const employeeRecord = await Employee.findById(employee);
    if (!employeeRecord) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const today = getStartOfDay(new Date());
    const existing = await Attendance.findOne({
      employee,
      date: { $gte: today, $lte: getEndOfDay(today) },
    });

    if (existing && existing.checkIn) {
      return errorResponse(res, 400, 'Employee has already checked in today');
    }

    const attendance = existing
      ? existing
      : new Attendance({ employee, date: new Date(), markedBy: req.user.id });

    attendance.checkIn = new Date();
    attendance.remarks = remarks || attendance.remarks;
    attendance.status = attendance.status || 'Present';
    attendance.markedBy = req.user.id;

    await attendance.save();

    return successResponse(res, 200, 'Check-in recorded successfully', attendance);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const checkOut = async (req, res) => {
  try {
    const parsed = checkOutSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid check-out data', parsed.error.errors);
    }

    const { employee, remarks } = parsed.data;
    const today = getStartOfDay(new Date());
    const attendance = await Attendance.findOne({
      employee,
      date: { $gte: today, $lte: getEndOfDay(today) },
    });

    if (!attendance || !attendance.checkIn) {
      return errorResponse(res, 400, 'Employee has not checked in today');
    }

    if (attendance.checkOut) {
      return errorResponse(res, 400, 'Employee has already checked out today');
    }

    const checkoutTime = new Date();
    attendance.checkOut = checkoutTime;
    attendance.workingHours = Number(((checkoutTime - attendance.checkIn) / (1000 * 60 * 60)).toFixed(2));
    attendance.remarks = remarks || attendance.remarks;
    attendance.markedBy = req.user.id;

    await attendance.save();

    return successResponse(res, 200, 'Check-out recorded successfully', attendance);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const markAttendance = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const parsed = attendanceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid attendance data', parsed.error.errors);
    }

    const { employee, date } = parsed.data;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee,
      date: { $gte: attendanceDate, $lte: getEndOfDay(attendanceDate) },
    });

    if (attendance) {
      Object.assign(attendance, parsed.data);
      attendance.markedBy = req.user.id;
      await attendance.save();
      return successResponse(res, 200, 'Attendance updated successfully', attendance);
    }

    const newAttendance = await Attendance.create({
      ...parsed.data,
      date: attendanceDate,
      markedBy: req.user.id,
    });

    return successResponse(res, 201, 'Attendance marked successfully', newAttendance);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return errorResponse(res, 404, 'Employee record not found for user');
    }

    const today = getStartOfDay(new Date());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayAttendance, monthlyAttendance] = await Promise.all([
      Attendance.findOne({
        employee: employee._id,
        date: { $gte: today, $lte: getEndOfDay(today) },
      }),
      Attendance.find({
        employee: employee._id,
        date: { $gte: monthStart, $lte: monthEnd },
      }).sort({ date: 1 }),
    ]);

    const stats = monthlyAttendance.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {}
    );

    return successResponse(res, 200, 'My attendance fetched successfully', {
      todayAttendance,
      monthlyAttendance,
      statistics: stats,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { page = 1, limit = 20, search, status, department, date } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const attendanceDate = new Date(date);
      query.date = { $gte: getStartOfDay(attendanceDate), $lte: getEndOfDay(attendanceDate) };
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

    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((emp) => emp._id) };
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'firstName lastName department')
        .populate('markedBy', 'name email role')
        .skip(skip)
        .limit(pageSize)
        .sort({ date: -1 }),
      Attendance.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Attendance records fetched successfully', {
      attendance,
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

export const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const attendance = await Attendance.find({ employee: id })
      .populate('employee', 'firstName lastName department')
      .populate('markedBy', 'name email role')
      .sort({ date: -1 });

    return successResponse(res, 200, 'Employee attendance fetched successfully', attendance);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const updateAttendance = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const parsed = attendanceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid attendance data', parsed.error.errors);
    }

    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return errorResponse(res, 404, 'Attendance not found');
    }

    Object.assign(attendance, parsed.data);

    if (attendance.checkIn && attendance.checkOut) {
      attendance.workingHours = Number(((new Date(attendance.checkOut) - new Date(attendance.checkIn)) / (1000 * 60 * 60)).toFixed(2));
    }

    attendance.markedBy = req.user.id;
    await attendance.save();

    return successResponse(res, 200, 'Attendance updated successfully', attendance);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return errorResponse(res, 404, 'Attendance not found');
    }

    return successResponse(res, 200, 'Attendance deleted successfully', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
