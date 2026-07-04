import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { generatePayrollSchema, updatePayrollSchema } from '../validators/payrollValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const calculateNetSalary = ({ basicSalary, allowances = 0, bonus = 0, deductions = 0, tax = 0 }) => {
  return basicSalary + allowances + bonus - deductions - tax;
};

export const generatePayroll = async (req, res) => {
  try {
    const parsed = generatePayrollSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid payroll data', parsed.error.errors);
    }

    const { employee, month, year, basicSalary, allowances = 0, bonus = 0, deductions = 0, tax = 0, remarks } = parsed.data;

    const employeeRecord = await Employee.findById(employee);
    if (!employeeRecord) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const duplicate = await Payroll.findOne({ employee, month, year });
    if (duplicate) {
      return errorResponse(res, 409, 'Payroll already generated for this employee for the specified month and year');
    }

    const netSalary = calculateNetSalary({ basicSalary, allowances, bonus, deductions, tax });

    const payroll = await Payroll.create({
      employee,
      month,
      year,
      basicSalary,
      allowances,
      bonus,
      deductions,
      tax,
      netSalary,
      generatedBy: req.user.id,
      remarks: remarks || '',
    });

    return successResponse(res, 201, 'Payroll generated successfully', payroll);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return errorResponse(res, 404, 'Employee record not found');
    }

    const payroll = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
    return successResponse(res, 200, 'My payroll fetched successfully', payroll);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { page = 1, limit = 20, search, month, year, paymentStatus, department } = req.query;
    const query = {};

    if (month) {
      query.month = Number(month);
    }

    if (year) {
      query.year = Number(year);
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    let employeeFilterIds = null;

    if (search) {
      const employees = await Employee.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      employeeFilterIds = employees.map((emp) => emp._id.toString());
    }

    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      const departmentIds = employees.map((emp) => emp._id.toString());
      employeeFilterIds = employeeFilterIds
        ? employeeFilterIds.filter((id) => departmentIds.includes(id))
        : departmentIds;
    }

    if (employeeFilterIds) {
      query.employee = { $in: employeeFilterIds };
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .populate('employee', 'firstName lastName department')
        .populate('generatedBy', 'name email role')
        .skip(skip)
        .limit(pageSize)
        .sort({ year: -1, month: -1 })
        .lean(),
      Payroll.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Payroll records fetched successfully', {
      payrolls,
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

export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate('employee', 'firstName lastName department user')
      .populate('generatedBy', 'name email role');

    if (!payroll) {
      return errorResponse(res, 404, 'Payroll not found');
    }

    if (!['Admin', 'HR'].includes(req.user.role)) {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee || employee._id.toString() !== payroll.employee._id.toString()) {
        return errorResponse(res, 403, 'Access denied');
      }
    }

    return successResponse(res, 200, 'Payroll fetched successfully', payroll);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const updatePayroll = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const parsed = updatePayrollSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid payroll data', parsed.error.errors);
    }

    const { id } = req.params;
    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return errorResponse(res, 404, 'Payroll not found');
    }

    Object.assign(payroll, parsed.data);

    if (
      parsed.data.basicSalary !== undefined ||
      parsed.data.allowances !== undefined ||
      parsed.data.bonus !== undefined ||
      parsed.data.deductions !== undefined ||
      parsed.data.tax !== undefined
    ) {
      payroll.netSalary = calculateNetSalary({
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        bonus: payroll.bonus,
        deductions: payroll.deductions,
        tax: payroll.tax,
      });
    }

    if (parsed.data.paymentDate) {
      payroll.paymentDate = new Date(parsed.data.paymentDate);
    }

    if (parsed.data.paymentStatus === 'Paid' && !payroll.paymentDate) {
      payroll.paymentDate = new Date();
    }

    await payroll.save();

    return successResponse(res, 200, 'Payroll updated successfully', payroll);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return errorResponse(res, 404, 'Payroll not found');
    }

    payroll.paymentStatus = 'Paid';
    payroll.paymentDate = new Date();
    await payroll.save();

    return successResponse(res, 200, 'Payroll marked as paid successfully', payroll);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deletePayroll = async (req, res) => {
  try {
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied');
    }

    const { id } = req.params;
    const payroll = await Payroll.findByIdAndDelete(id);
    if (!payroll) {
      return errorResponse(res, 404, 'Payroll not found');
    }

    return successResponse(res, 200, 'Payroll deleted successfully', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
