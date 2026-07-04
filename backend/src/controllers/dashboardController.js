import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
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

const getMonthLabel = (monthIndex) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2026, monthIndex, 1));
};

export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = getStartOfDay(new Date());
    const todayEnd = getEndOfDay(new Date());

    const [
      totalEmployees,
      totalDepartments,
      activeEmployees,
      inactiveEmployees,
      attendanceCounts,
      leaveCounts,
      payrollCounts,
      recentEmployees,
      departmentDistribution,
      monthlyAttendance,
    ] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: 'Inactive' }),
      Attendance.aggregate([
        {
          $match: {
            date: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Leave.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Payroll.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]),
      Employee.find()
        .sort({ joiningDate: -1 })
        .limit(5)
        .select('employeeId firstName lastName department joiningDate status')
        .lean(),
      Employee.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$department', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            department: '$_id',
            count: 1,
          },
        },
        {
          $sort: { count: -1, department: 1 },
        },
      ]),
      (async () => {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
          months.push({ start, end, label: getMonthLabel(date.getMonth()), year: date.getFullYear(), month: date.getMonth() + 1 });
        }

        const rangeStart = months[0].start;
        const rangeEnd = months[months.length - 1].end;

        const attendanceAggregation = await Attendance.aggregate([
          {
            $match: {
              date: { $gte: rangeStart, $lte: rangeEnd },
            },
          },
          {
            $project: {
              month: { $month: '$date' },
              year: { $year: '$date' },
              status: 1,
            },
          },
          {
            $group: {
              _id: { month: '$month', year: '$year', status: '$status' },
              count: { $sum: 1 },
            },
          },
        ]);

        const monthlyMap = months.map((month) => ({
          month: month.label,
          year: month.year,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          halfDay: 0,
        }));

        attendanceAggregation.forEach((item) => {
          const monthIndex = months.findIndex(
            (month) => month.month === item._id.month && month.year === item._id.year
          );
          if (monthIndex >= 0) {
            const statusKey = item._id.status === 'Present' ? 'present' : item._id.status === 'Absent' ? 'absent' : item._id.status === 'Late' ? 'late' : item._id.status === 'Leave' ? 'leave' : item._id.status === 'Half-Day' ? 'halfDay' : null;
            if (statusKey) {
              monthlyMap[monthIndex][statusKey] = item.count;
            }
          }
        });

        return monthlyMap;
      })(),
    ]);

    const attendance = {
      presentToday: 0,
      absentToday: 0,
      lateToday: 0,
      leaveToday: 0,
    };
    attendanceCounts.forEach((item) => {
      if (item._id === 'Present') attendance.presentToday = item.count;
      if (item._id === 'Absent') attendance.absentToday = item.count;
      if (item._id === 'Late') attendance.lateToday = item.count;
      if (item._id === 'Leave') attendance.leaveToday = item.count;
    });

    const leaves = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    leaveCounts.forEach((item) => {
      if (item._id === 'Pending') leaves.pending = item.count;
      if (item._id === 'Approved') leaves.approved = item.count;
      if (item._id === 'Rejected') leaves.rejected = item.count;
    });

    const payroll = {
      paid: 0,
      pending: 0,
    };
    payrollCounts.forEach((item) => {
      if (item._id === 'Paid') payroll.paid = item.count;
      if (item._id === 'Pending') payroll.pending = item.count;
    });

    return successResponse(res, 200, 'Dashboard stats fetched successfully', {
      totalEmployees,
      totalDepartments,
      activeEmployees,
      inactiveEmployees,
      attendance,
      leaves,
      payroll,
      recentEmployees,
      monthlyAttendance,
      departmentDistribution,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
