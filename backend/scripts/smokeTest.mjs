import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import Department from '../src/models/Department.js';
import Employee from '../src/models/Employee.js';
import Attendance from '../src/models/Attendance.js';
import Leave from '../src/models/Leave.js';
import Payroll from '../src/models/Payroll.js';
import User from '../src/models/User.js';

dotenv.config();

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const runId = Date.now();
const prefix = `smoke-${runId}`;
const results = [];

const created = {
  users: {},
  departments: {},
  employees: {},
  attendance: {},
  leaves: {},
  payrolls: {},
};

const sanitize = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key.toLowerCase().includes('token') ? '[redacted]' : sanitize(item),
      ])
    );
  }

  return value;
};

const record = (module, name, ok, detail = {}) => {
  const entry = {
    module,
    name,
    ok,
    ...sanitize(detail),
  };

  results.push(entry);
  console.log(JSON.stringify(entry));
  return ok;
};

const request = async (method, path, { token, body, headers = {} } = {}) => {
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsedBody;

  try {
    parsedBody = text ? JSON.parse(text) : null;
  } catch (error) {
    parsedBody = text;
  }

  return {
    status: response.status,
    body: parsedBody,
  };
};

const hasValidationErrors = (response) =>
  Array.isArray(response.body?.errors) && response.body.errors.length > 0;

const expectStatus = (module, name, response, expectedStatus, condition = true, note = '') =>
  record(module, name, response.status === expectedStatus && condition, {
    expectedStatus,
    actualStatus: response.status,
    note,
    response,
  });

const expectCondition = (module, name, condition, detail = {}) => record(module, name, condition, detail);

const connectForVerification = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

const verifyDocument = async (module, name, Model, id, predicate = () => true) => {
  const document = await Model.findById(id).lean();
  return expectCondition(module, name, Boolean(document) && predicate(document), {
    id,
    document,
  });
};

const verifyMissingDocument = async (module, name, Model, id) => {
  const document = await Model.findById(id).lean();
  return expectCondition(module, name, !document, {
    id,
    document,
  });
};

const createUserPayload = (label, role) => ({
  name: `${label} ${role}`,
  email: `${prefix}-${label.toLowerCase()}-${role.toLowerCase()}@example.com`,
  password: 'Secret1!',
  role,
});

const currentDate = new Date();
const nextDay = new Date(currentDate);
nextDay.setDate(nextDay.getDate() + 1);
const twoDaysLater = new Date(currentDate);
twoDaysLater.setDate(twoDaysLater.getDate() + 2);
const threeDaysLater = new Date(currentDate);
threeDaysLater.setDate(threeDaysLater.getDate() + 3);

const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
const previousMonth = previousMonthDate.getMonth() + 1;
const previousYear = previousMonthDate.getFullYear();

const getCurrentMonthLabel = () =>
  new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(currentYear, currentMonth - 1, 1)
  );

const run = async () => {
  let baselineStats;

  await connectForVerification();

  const authUsers = {
    admin: createUserPayload('Admin', 'Admin'),
    hr: createUserPayload('HR', 'HR'),
    manager: createUserPayload('Manager', 'Manager'),
    employee: createUserPayload('Employee', 'Employee'),
    temp: createUserPayload('Temp', 'Employee'),
  };

  const invalidRegister = await request('POST', '/api/auth/register', {
    body: { name: 'A', email: 'not-an-email', password: '123', role: 'Admin' },
  });
  expectStatus('AUTH', 'register validation', invalidRegister, 400, hasValidationErrors(invalidRegister));

  for (const [key, payload] of Object.entries(authUsers)) {
    const response = await request('POST', '/api/auth/register', { body: payload });
    const ok = expectStatus(
      'AUTH',
      `register ${key}`,
      response,
      201,
      Boolean(response.body?.data?.id)
    );

    if (!ok) {
      throw new Error(`Failed to register ${key}`);
    }

    created.users[key] = {
      ...payload,
      id: response.body.data.id,
    };
  }

  const duplicateRegister = await request('POST', '/api/auth/register', {
    body: authUsers.admin,
  });
  expectStatus('AUTH', 'register duplicate email', duplicateRegister, 400);

  const invalidLogin = await request('POST', '/api/auth/login', {
    body: { email: 'bad-email', password: '123' },
  });
  expectStatus('AUTH', 'login validation', invalidLogin, 400, hasValidationErrors(invalidLogin));

  for (const key of Object.keys(created.users)) {
    const user = created.users[key];

    // 1. Verify login is blocked before verification
    const blockedLogin = await request('POST', '/api/auth/login', {
      body: { email: user.email, password: user.password },
    });
    expectStatus('AUTH', `login blocked before verification ${key}`, blockedLogin, 403);

    // 2. Fetch the verification OTP from MongoDB
    const dbUser = await User.findById(user.id);
    const otp = dbUser.verificationOtp;

    // 3. Verify the email using the OTP
    const verifyEmailRes = await request('POST', '/api/auth/verify-email', {
      body: { email: user.email, otp },
    });
    expectStatus('AUTH', `verify email ${key}`, verifyEmailRes, 200);

    // 4. Perform successful login after verification
    const response = await request('POST', '/api/auth/login', {
      body: { email: user.email, password: user.password },
    });
    const ok = expectStatus(
      'AUTH',
      `login ${key}`,
      response,
      200,
      Boolean(response.body?.data?.token) && response.body?.data?.user?.id === user.id
    );

    if (!ok) {
      throw new Error(`Failed to login ${key}`);
    }

    created.users[key].token = response.body.data.token;
  }

  const meUnauthorized = await request('GET', '/api/auth/me');
  expectStatus('AUTH', 'me requires jwt', meUnauthorized, 401);

  const meInvalidToken = await request('GET', '/api/auth/me', {
    token: 'invalid.jwt.token',
  });
  expectStatus('AUTH', 'me rejects invalid jwt', meInvalidToken, 401);

  const meAuthorized = await request('GET', '/api/auth/me', {
    token: created.users.admin.token,
  });
  expectStatus(
    'AUTH',
    'me returns current user',
    meAuthorized,
    200,
    meAuthorized.body?.data?.email === created.users.admin.email
  );

  const baselineDashboard = await request('GET', '/api/dashboard/stats', {
    token: created.users.admin.token,
  });
  const baselineOk = expectStatus('DASHBOARD', 'baseline stats (admin)', baselineDashboard, 200);
  if (!baselineOk) {
    throw new Error('Unable to capture baseline dashboard stats');
  }
  baselineStats = baselineDashboard.body.data;

  const dashboardEmployeeForbidden = await request('GET', '/api/dashboard/stats', {
    token: created.users.employee.token,
  });
  expectStatus('DASHBOARD', 'employee forbidden from stats', dashboardEmployeeForbidden, 403);

  const dashboardManagerAllowed = await request('GET', '/api/dashboard/stats', {
    token: created.users.manager.token,
  });
  expectStatus('DASHBOARD', 'manager allowed for stats', dashboardManagerAllowed, 200);

  const departmentNames = {
    active: `${prefix}-Operations`,
    inactive: `${prefix}-Finance`,
    delete: `${prefix}-Archive`,
    updated: `${prefix}-Operations-Updated`,
  };

  const invalidDepartment = await request('POST', '/api/departments', {
    token: created.users.hr.token,
    body: { name: 'A' },
  });
  expectStatus(
    'DEPARTMENT',
    'create validation',
    invalidDepartment,
    400,
    hasValidationErrors(invalidDepartment)
  );

  const forbiddenDepartment = await request('POST', '/api/departments', {
    token: created.users.employee.token,
    body: { name: `${prefix}-Forbidden` },
  });
  expectStatus('DEPARTMENT', 'employee forbidden to create', forbiddenDepartment, 403);

  for (const [key, name] of [
    ['active', departmentNames.active],
    ['inactive', departmentNames.inactive],
    ['delete', departmentNames.delete],
  ]) {
    const response = await request('POST', '/api/departments', {
      token: created.users.hr.token,
      body: {
        name,
        description: `${name} department`,
        manager: created.users.manager.id,
        status: key === 'inactive' ? 'Inactive' : 'Active',
      },
    });

    const ok = expectStatus(
      'DEPARTMENT',
      `create ${key}`,
      response,
      201,
      Boolean(response.body?.data?._id)
    );

    if (!ok) {
      throw new Error(`Failed to create ${key} department`);
    }

    created.departments[key] = response.body.data;
  }

  const listDepartments = await request('GET', '/api/departments', {
    token: created.users.hr.token,
  });
  expectStatus(
    'DEPARTMENT',
    'list',
    listDepartments,
    200,
    Array.isArray(listDepartments.body?.data?.departments) &&
      listDepartments.body.data.departments.some(
        (department) => department._id === created.departments.active._id
      )
  );

  const paginateDepartments = await request('GET', '/api/departments?page=1&limit=1', {
    token: created.users.hr.token,
  });
  expectStatus(
    'DEPARTMENT',
    'pagination',
    paginateDepartments,
    200,
    paginateDepartments.body?.data?.pagination?.limit === 1
  );

  const searchDepartments = await request(
    'GET',
    `/api/departments?search=${encodeURIComponent(prefix)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'DEPARTMENT',
    'search',
    searchDepartments,
    200,
    searchDepartments.body?.data?.departments?.some(
      (department) => department._id === created.departments.active._id
    )
  );

  const filterDepartments = await request('GET', '/api/departments?status=Inactive', {
    token: created.users.hr.token,
  });
  expectStatus(
    'DEPARTMENT',
    'status filter',
    filterDepartments,
    200,
    filterDepartments.body?.data?.departments?.every(
      (department) => department.status === 'Inactive'
    )
  );

  const getDepartment = await request(
    'GET',
    `/api/departments/${created.departments.active._id}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'DEPARTMENT',
    'get by id',
    getDepartment,
    200,
    getDepartment.body?.data?._id === created.departments.active._id
  );

  const updateDepartment = await request(
    'PUT',
    `/api/departments/${created.departments.active._id}`,
    {
      token: created.users.hr.token,
      body: { name: departmentNames.updated, description: 'Updated department name' },
    }
  );
  expectStatus(
    'DEPARTMENT',
    'update',
    updateDepartment,
    200,
    updateDepartment.body?.data?.name === departmentNames.updated
  );
  created.departments.active = updateDepartment.body.data;

  await verifyDocument(
    'DEPARTMENT',
    'mongo persistence after update',
    Department,
    created.departments.active._id,
    (department) => department.name === departmentNames.updated
  );

  const deleteDepartment = await request(
    'DELETE',
    `/api/departments/${created.departments.delete._id}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus('DEPARTMENT', 'delete', deleteDepartment, 200);
  await verifyMissingDocument(
    'DEPARTMENT',
    'mongo persistence after delete',
    Department,
    created.departments.delete._id
  );

  const invalidEmployee = await request('POST', '/api/employees', {
    token: created.users.hr.token,
    body: { firstName: 'Only', lastName: 'Name' },
  });
  expectStatus('EMPLOYEE', 'create validation', invalidEmployee, 400, hasValidationErrors(invalidEmployee));

  const forbiddenEmployeeCreate = await request('POST', '/api/employees', {
    token: created.users.employee.token,
    body: {
      employeeId: `${prefix}-forbidden`,
      user: created.users.employee.id,
      firstName: 'Forbidden',
      lastName: 'Employee',
    },
  });
  expectStatus('EMPLOYEE', 'employee forbidden to create', forbiddenEmployeeCreate, 403);

  const employeePayloads = {
    admin: {
      employeeId: `${prefix}-EMP-ADMIN`,
      user: created.users.admin.id,
      firstName: 'Ava',
      lastName: prefix,
      department: departmentNames.updated,
      status: 'Active',
      designation: 'Administrator',
      salary: 95000,
      manager: created.users.manager.id,
    },
    hr: {
      employeeId: `${prefix}-EMP-HR`,
      user: created.users.hr.id,
      firstName: 'Harper',
      lastName: prefix,
      department: departmentNames.inactive,
      status: 'Active',
      designation: 'HR Lead',
      salary: 85000,
      manager: created.users.manager.id,
    },
    manager: {
      employeeId: `${prefix}-EMP-MANAGER`,
      user: created.users.manager.id,
      firstName: 'Mason',
      lastName: prefix,
      department: departmentNames.updated,
      status: 'Active',
      designation: 'Operations Manager',
      salary: 90000,
      manager: created.users.admin.id,
    },
    employee: {
      employeeId: `${prefix}-EMP-EMPLOYEE`,
      user: created.users.employee.id,
      firstName: 'Eli',
      lastName: prefix,
      department: departmentNames.updated,
      status: 'Active',
      designation: 'QA Engineer',
      salary: 65000,
      manager: created.users.manager.id,
    },
    temp: {
      employeeId: `${prefix}-EMP-TEMP`,
      user: created.users.temp.id,
      firstName: 'Nova',
      lastName: prefix,
      department: departmentNames.inactive,
      status: 'Inactive',
      designation: 'Analyst',
      salary: 50000,
      manager: created.users.hr.id,
    },
  };

  for (const [key, payload] of Object.entries(employeePayloads)) {
    const response = await request('POST', '/api/employees', {
      token: created.users.hr.token,
      body: payload,
    });

    const ok = expectStatus(
      'EMPLOYEE',
      `create ${key}`,
      response,
      201,
      Boolean(response.body?.data?._id)
    );

    if (!ok) {
      throw new Error(`Failed to create ${key} employee`);
    }

    created.employees[key] = response.body.data;
  }

  const listEmployees = await request('GET', '/api/employees', {
    token: created.users.hr.token,
  });
  expectStatus(
    'EMPLOYEE',
    'list',
    listEmployees,
    200,
    listEmployees.body?.data?.employees?.some(
      (employee) => employee._id === created.employees.employee._id
    )
  );

  const paginateEmployees = await request('GET', '/api/employees?page=1&limit=2', {
    token: created.users.hr.token,
  });
  expectStatus(
    'EMPLOYEE',
    'pagination',
    paginateEmployees,
    200,
    paginateEmployees.body?.data?.pagination?.limit === 2
  );

  const searchEmployees = await request(
    'GET',
    `/api/employees?search=${encodeURIComponent(employeePayloads.employee.employeeId)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'EMPLOYEE',
    'search',
    searchEmployees,
    200,
    searchEmployees.body?.data?.employees?.some(
      (employee) => employee._id === created.employees.employee._id
    )
  );

  const filterEmployeesByDepartment = await request(
    'GET',
    `/api/employees?department=${encodeURIComponent(departmentNames.updated)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'EMPLOYEE',
    'department filter',
    filterEmployeesByDepartment,
    200,
    filterEmployeesByDepartment.body?.data?.employees?.every(
      (employee) => employee.department === departmentNames.updated
    )
  );

  const filterEmployeesByStatus = await request('GET', '/api/employees?status=Active', {
    token: created.users.hr.token,
  });
  expectStatus(
    'EMPLOYEE',
    'status filter',
    filterEmployeesByStatus,
    200,
    filterEmployeesByStatus.body?.data?.employees?.every(
      (employee) => employee.status === 'Active'
    )
  );

  const getEmployee = await request(
    'GET',
    `/api/employees/${created.employees.employee._id}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'EMPLOYEE',
    'get by id',
    getEmployee,
    200,
    getEmployee.body?.data?._id === created.employees.employee._id
  );

  const updateEmployee = await request(
    'PUT',
    `/api/employees/${created.employees.employee._id}`,
    {
      token: created.users.hr.token,
      body: { designation: 'Senior QA Engineer' },
    }
  );
  expectStatus(
    'EMPLOYEE',
    'update',
    updateEmployee,
    200,
    updateEmployee.body?.data?.designation === 'Senior QA Engineer'
  );
  created.employees.employee = updateEmployee.body.data;

  await verifyDocument(
    'EMPLOYEE',
    'mongo persistence after update',
    Employee,
    created.employees.employee._id,
    (employee) => employee.designation === 'Senior QA Engineer'
  );

  const deleteEmployee = await request(
    'DELETE',
    `/api/employees/${created.employees.temp._id}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus('EMPLOYEE', 'delete', deleteEmployee, 200);
  await verifyMissingDocument(
    'EMPLOYEE',
    'mongo persistence after delete',
    Employee,
    created.employees.temp._id
  );

  const invalidCheckin = await request('POST', '/api/attendance/checkin', {
    token: created.users.employee.token,
    body: {},
  });
  expectStatus(
    'ATTENDANCE',
    'checkin validation',
    invalidCheckin,
    400,
    hasValidationErrors(invalidCheckin)
  );

  const checkin = await request('POST', '/api/attendance/checkin', {
    token: created.users.employee.token,
    body: {
      employee: created.employees.employee._id,
      remarks: `${prefix} checkin`,
    },
  });
  const checkinOk = expectStatus(
    'ATTENDANCE',
    'checkin',
    checkin,
    200,
    Boolean(checkin.body?.data?._id)
  );
  if (!checkinOk) {
    throw new Error('Failed to check in employee');
  }
  created.attendance.record = checkin.body.data;

  await verifyDocument(
    'ATTENDANCE',
    'mongo persistence after checkin',
    Attendance,
    created.attendance.record._id,
    (attendance) => attendance.employee.toString() === created.employees.employee._id
  );

  const duplicateCheckin = await request('POST', '/api/attendance/checkin', {
    token: created.users.employee.token,
    body: { employee: created.employees.employee._id },
  });
  expectStatus('ATTENDANCE', 'duplicate checkin rejected', duplicateCheckin, 400);

  const invalidCheckout = await request('POST', '/api/attendance/checkout', {
    token: created.users.employee.token,
    body: {},
  });
  expectStatus(
    'ATTENDANCE',
    'checkout validation',
    invalidCheckout,
    400,
    hasValidationErrors(invalidCheckout)
  );

  const checkout = await request('POST', '/api/attendance/checkout', {
    token: created.users.employee.token,
    body: {
      employee: created.employees.employee._id,
      remarks: `${prefix} checkout`,
    },
  });
  expectStatus(
    'ATTENDANCE',
    'checkout',
    checkout,
    200,
    Boolean(checkout.body?.data?.checkOut)
  );
  created.attendance.record = checkout.body.data;

  const myAttendance = await request('GET', '/api/attendance/me', {
    token: created.users.employee.token,
  });
  expectStatus(
    'ATTENDANCE',
    'me',
    myAttendance,
    200,
    myAttendance.body?.data?.todayAttendance?._id === created.attendance.record._id
  );

  const listAttendance = await request('GET', '/api/attendance', {
    token: created.users.hr.token,
  });
  expectStatus(
    'ATTENDANCE',
    'list',
    listAttendance,
    200,
    listAttendance.body?.data?.attendance?.some(
      (attendance) => attendance._id === created.attendance.record._id
    )
  );

  const paginateAttendance = await request('GET', '/api/attendance?page=1&limit=1', {
    token: created.users.hr.token,
  });
  expectStatus(
    'ATTENDANCE',
    'pagination',
    paginateAttendance,
    200,
    paginateAttendance.body?.data?.pagination?.limit === 1
  );

  const searchAttendance = await request(
    'GET',
    `/api/attendance?search=${encodeURIComponent(employeePayloads.employee.firstName)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'ATTENDANCE',
    'search',
    searchAttendance,
    200,
    searchAttendance.body?.data?.attendance?.some(
      (attendance) => attendance._id === created.attendance.record._id
    )
  );

  const filterAttendanceByStatus = await request('GET', '/api/attendance?status=Present', {
    token: created.users.hr.token,
  });
  expectStatus(
    'ATTENDANCE',
    'status filter',
    filterAttendanceByStatus,
    200,
    filterAttendanceByStatus.body?.data?.attendance?.every(
      (attendance) => attendance.status === 'Present'
    )
  );

  const filterAttendanceByDepartment = await request(
    'GET',
    `/api/attendance?department=${encodeURIComponent(departmentNames.updated)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'ATTENDANCE',
    'department filter',
    filterAttendanceByDepartment,
    200,
    filterAttendanceByDepartment.body?.data?.attendance?.some(
      (attendance) => attendance._id === created.attendance.record._id
    )
  );

  const attendanceForbidden = await request('GET', '/api/attendance', {
    token: created.users.employee.token,
  });
  expectStatus('ATTENDANCE', 'employee forbidden from list', attendanceForbidden, 403);

  const invalidLeave = await request('POST', '/api/leaves', {
    token: created.users.employee.token,
    body: {
      employee: created.employees.employee._id,
      leaveType: 'Paid',
      startDate: twoDaysLater.toISOString(),
      endDate: nextDay.toISOString(),
      reason: 'Invalid leave range',
    },
  });
  expectStatus('LEAVE', 'create validation', invalidLeave, 400, hasValidationErrors(invalidLeave));

  const leaveRequests = {
    approve: {
      employee: created.employees.employee._id,
      leaveType: 'Paid',
      startDate: nextDay.toISOString(),
      endDate: twoDaysLater.toISOString(),
      reason: `${prefix} approve`,
    },
    reject: {
      employee: created.employees.employee._id,
      leaveType: 'Sick',
      startDate: twoDaysLater.toISOString(),
      endDate: threeDaysLater.toISOString(),
      reason: `${prefix} reject`,
    },
  };

  for (const [key, payload] of Object.entries(leaveRequests)) {
    const response = await request('POST', '/api/leaves', {
      token: created.users.employee.token,
      body: payload,
    });
    const ok = expectStatus(
      'LEAVE',
      `create ${key}`,
      response,
      201,
      Boolean(response.body?.data?._id)
    );

    if (!ok) {
      throw new Error(`Failed to create ${key} leave`);
    }

    created.leaves[key] = response.body.data;
  }

  const myLeaves = await request('GET', '/api/leaves/me', {
    token: created.users.employee.token,
  });
  expectStatus(
    'LEAVE',
    'me',
    myLeaves,
    200,
    myLeaves.body?.data?.some((leave) => leave._id === created.leaves.approve._id)
  );

  const listLeaves = await request('GET', '/api/leaves?status=Pending', {
    token: created.users.hr.token,
  });
  expectStatus(
    'LEAVE',
    'list',
    listLeaves,
    200,
    listLeaves.body?.data?.leaves?.some((leave) => leave._id === created.leaves.approve._id)
  );

  const paginateLeaves = await request('GET', '/api/leaves?page=1&limit=1', {
    token: created.users.hr.token,
  });
  expectStatus(
    'LEAVE',
    'pagination',
    paginateLeaves,
    200,
    paginateLeaves.body?.data?.pagination?.limit === 1
  );

  const searchLeaves = await request(
    'GET',
    `/api/leaves?search=${encodeURIComponent(employeePayloads.employee.firstName)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'LEAVE',
    'search',
    searchLeaves,
    200,
    searchLeaves.body?.data?.leaves?.some((leave) => leave._id === created.leaves.approve._id)
  );

  const filterLeaves = await request('GET', '/api/leaves?leaveType=Paid', {
    token: created.users.hr.token,
  });
  expectStatus(
    'LEAVE',
    'leave type filter',
    filterLeaves,
    200,
    filterLeaves.body?.data?.leaves?.every((leave) => leave.leaveType === 'Paid')
  );

  const approveLeave = await request(
    'PUT',
    `/api/leaves/${created.leaves.approve._id}/approve`,
    {
      token: created.users.hr.token,
      body: {},
    }
  );
  expectStatus(
    'LEAVE',
    'approve',
    approveLeave,
    200,
    approveLeave.body?.data?.status === 'Approved'
  );

  const rejectLeave = await request(
    'PUT',
    `/api/leaves/${created.leaves.reject._id}/reject`,
    {
      token: created.users.hr.token,
      body: { comments: 'Rejected during smoke test' },
    }
  );
  expectStatus(
    'LEAVE',
    'reject',
    rejectLeave,
    200,
    rejectLeave.body?.data?.status === 'Rejected'
  );

  await verifyDocument(
    'LEAVE',
    'mongo persistence after approval',
    Leave,
    created.leaves.approve._id,
    (leave) => leave.status === 'Approved'
  );
  await verifyDocument(
    'LEAVE',
    'mongo persistence after rejection',
    Leave,
    created.leaves.reject._id,
    (leave) => leave.status === 'Rejected'
  );

  const leaveForbidden = await request('GET', '/api/leaves', {
    token: created.users.employee.token,
  });
  expectStatus('LEAVE', 'employee forbidden from list', leaveForbidden, 403);

  const invalidPayroll = await request('POST', '/api/payroll', {
    token: created.users.hr.token,
    body: {
      employee: created.employees.employee._id,
      month: currentMonth,
      year: currentYear,
      basicSalary: -1,
    },
  });
  expectStatus(
    'PAYROLL',
    'create validation',
    invalidPayroll,
    400,
    hasValidationErrors(invalidPayroll)
  );

  const payrollForbidden = await request('POST', '/api/payroll', {
    token: created.users.employee.token,
    body: {
      employee: created.employees.employee._id,
      month: currentMonth,
      year: currentYear,
      basicSalary: 1000,
    },
  });
  expectStatus('PAYROLL', 'employee forbidden to create', payrollForbidden, 403);

  const payrollPayloads = {
    paidTarget: {
      employee: created.employees.employee._id,
      month: currentMonth,
      year: currentYear,
      basicSalary: 5000,
      allowances: 200,
      deductions: 100,
      tax: 50,
      bonus: 300,
      remarks: `${prefix} payroll paid target`,
    },
    pendingTarget: {
      employee: created.employees.manager._id,
      month: previousMonth,
      year: previousYear,
      basicSalary: 7000,
      allowances: 500,
      deductions: 200,
      tax: 100,
      bonus: 0,
      remarks: `${prefix} payroll pending target`,
    },
  };

  for (const [key, payload] of Object.entries(payrollPayloads)) {
    const response = await request('POST', '/api/payroll', {
      token: created.users.hr.token,
      body: payload,
    });
    const ok = expectStatus(
      'PAYROLL',
      `create ${key}`,
      response,
      201,
      Boolean(response.body?.data?._id)
    );

    if (!ok) {
      throw new Error(`Failed to create ${key} payroll`);
    }

    created.payrolls[key] = response.body.data;
  }

  const myPayroll = await request('GET', '/api/payroll/me', {
    token: created.users.employee.token,
  });
  expectStatus(
    'PAYROLL',
    'me',
    myPayroll,
    200,
    myPayroll.body?.data?.some(
      (payroll) => payroll._id === created.payrolls.paidTarget._id
    )
  );

  const listPayroll = await request('GET', '/api/payroll', {
    token: created.users.hr.token,
  });
  expectStatus(
    'PAYROLL',
    'list',
    listPayroll,
    200,
    listPayroll.body?.data?.payrolls?.some(
      (payroll) => payroll._id === created.payrolls.paidTarget._id
    )
  );

  const paginatePayroll = await request('GET', '/api/payroll?page=1&limit=1', {
    token: created.users.hr.token,
  });
  expectStatus(
    'PAYROLL',
    'pagination',
    paginatePayroll,
    200,
    paginatePayroll.body?.data?.pagination?.limit === 1
  );

  const searchPayroll = await request(
    'GET',
    `/api/payroll?search=${encodeURIComponent(employeePayloads.employee.firstName)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'PAYROLL',
    'search',
    searchPayroll,
    200,
    searchPayroll.body?.data?.payrolls?.some(
      (payroll) => payroll._id === created.payrolls.paidTarget._id
    )
  );

  const monthFilterPayroll = await request(
    'GET',
    `/api/payroll?month=${currentMonth}&year=${currentYear}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'PAYROLL',
    'month and year filter',
    monthFilterPayroll,
    200,
    monthFilterPayroll.body?.data?.payrolls?.some(
      (payroll) => payroll._id === created.payrolls.paidTarget._id
    )
  );

  const departmentFilterPayroll = await request(
    'GET',
    `/api/payroll?department=${encodeURIComponent(departmentNames.updated)}`,
    {
      token: created.users.hr.token,
    }
  );
  expectStatus(
    'PAYROLL',
    'department filter',
    departmentFilterPayroll,
    200,
    departmentFilterPayroll.body?.data?.payrolls?.some(
      (payroll) => payroll._id === created.payrolls.paidTarget._id
    )
  );

  const payPayroll = await request(
    'PUT',
    `/api/payroll/${created.payrolls.paidTarget._id}/pay`,
    {
      token: created.users.hr.token,
      body: {},
    }
  );
  expectStatus(
    'PAYROLL',
    'mark paid',
    payPayroll,
    200,
    payPayroll.body?.data?.paymentStatus === 'Paid'
  );

  const paidFilterPayroll = await request('GET', '/api/payroll?paymentStatus=Paid', {
    token: created.users.hr.token,
  });
  expectStatus(
    'PAYROLL',
    'payment status filter',
    paidFilterPayroll,
    200,
    paidFilterPayroll.body?.data?.payrolls?.every(
      (payroll) => payroll.paymentStatus === 'Paid'
    ) &&
      paidFilterPayroll.body?.data?.payrolls?.some(
        (payroll) => payroll._id === created.payrolls.paidTarget._id
      )
  );

  await verifyDocument(
    'PAYROLL',
    'mongo persistence after payment',
    Payroll,
    created.payrolls.paidTarget._id,
    (payroll) => payroll.paymentStatus === 'Paid'
  );

  const payrollListForbidden = await request('GET', '/api/payroll', {
    token: created.users.employee.token,
  });
  expectStatus('PAYROLL', 'employee forbidden from list', payrollListForbidden, 403);

  const finalDashboard = await request('GET', '/api/dashboard/stats', {
    token: created.users.admin.token,
  });
  const finalDashboardOk = expectStatus('DASHBOARD', 'final stats (admin)', finalDashboard, 200);
  if (!finalDashboardOk) {
    throw new Error('Unable to fetch final dashboard stats');
  }

  const finalStats = finalDashboard.body.data;
  const currentMonthEntry = finalStats.monthlyAttendance?.find(
    (entry) => entry.month === getCurrentMonthLabel() && entry.year === currentYear
  );
  const baselineMonthEntry = baselineStats.monthlyAttendance?.find(
    (entry) => entry.month === getCurrentMonthLabel() && entry.year === currentYear
  );

  expectCondition(
    'DASHBOARD',
    'total employees aggregate',
    finalStats.totalEmployees === baselineStats.totalEmployees + 4,
    {
      before: baselineStats.totalEmployees,
      after: finalStats.totalEmployees,
    }
  );
  expectCondition(
    'DASHBOARD',
    'total departments aggregate',
    finalStats.totalDepartments === baselineStats.totalDepartments + 2,
    {
      before: baselineStats.totalDepartments,
      after: finalStats.totalDepartments,
    }
  );
  expectCondition(
    'DASHBOARD',
    'attendance aggregate',
    finalStats.attendance.presentToday === baselineStats.attendance.presentToday + 1,
    {
      before: baselineStats.attendance.presentToday,
      after: finalStats.attendance.presentToday,
    }
  );
  expectCondition(
    'DASHBOARD',
    'leave aggregate',
    finalStats.leaves.approved === baselineStats.leaves.approved + 1 &&
      finalStats.leaves.rejected === baselineStats.leaves.rejected + 1,
    {
      before: baselineStats.leaves,
      after: finalStats.leaves,
    }
  );
  expectCondition(
    'DASHBOARD',
    'payroll aggregate',
    finalStats.payroll.paid === baselineStats.payroll.paid + 1 &&
      finalStats.payroll.pending === baselineStats.payroll.pending + 1,
    {
      before: baselineStats.payroll,
      after: finalStats.payroll,
    }
  );
  expectCondition(
    'DASHBOARD',
    'department distribution aggregate',
    finalStats.departmentDistribution?.some(
      (entry) => entry.department === departmentNames.updated && entry.count >= 3
    ) &&
      finalStats.departmentDistribution?.some(
        (entry) => entry.department === departmentNames.inactive && entry.count >= 1
      ),
    {
      departmentDistribution: finalStats.departmentDistribution,
    }
  );
  expectCondition(
    'DASHBOARD',
    'monthly attendance aggregate',
    Boolean(currentMonthEntry) &&
      Boolean(baselineMonthEntry) &&
      currentMonthEntry.present === baselineMonthEntry.present + 1,
    {
      before: baselineMonthEntry,
      after: currentMonthEntry,
    }
  );
  expectCondition(
    'DASHBOARD',
    'recent employees contains smoke data',
    finalStats.recentEmployees?.some((employee) =>
      String(employee.employeeId || '').startsWith(prefix)
    ),
    {
      recentEmployees: finalStats.recentEmployees,
    }
  );

  const failures = results.filter((result) => !result.ok);
  const summary = {
    runId: prefix,
    baseUrl,
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    failedChecks: failures.map(({ module, name }) => ({ module, name })),
  };

  const markdownReport = [
    '# HRMS API Smoke Test Report',
    '',
    `- Run ID: \`${prefix}\``,
    `- Base URL: \`${baseUrl}\``,
    `- Total checks: \`${summary.total}\``,
    `- Passed: \`${summary.passed}\``,
    `- Failed: \`${summary.failed}\``,
    '',
    '## Verification Coverage',
    '',
    '- HTTP status codes',
    '- JWT authentication',
    '- Role authorization',
    '- MongoDB persistence',
    '- Validation',
    '- Pagination',
    '- Search',
    '- Filtering',
    '- Aggregation queries',
    '',
    '## Failures',
    '',
    ...(failures.length
      ? failures.map((failure) => `- [${failure.module}] ${failure.name}`)
      : ['- None']),
    '',
  ].join('\n');

  fs.writeFileSync(
    './scripts/smoke-results.json',
    JSON.stringify({ summary, results }, null, 2)
  );
  fs.writeFileSync('./scripts/smoke-report.md', markdownReport);

  console.log(JSON.stringify({ summary }));
  process.exit(failures.length === 0 ? 0 : 2);
};

run()
  .catch((error) => {
    record('SYSTEM', 'unhandled error', false, {
      message: error.message,
      stack: error.stack,
    });

    const summary = {
      runId: prefix,
      baseUrl,
      total: results.length,
      passed: results.filter((result) => result.ok).length,
      failed: results.filter((result) => !result.ok).length,
    };

    fs.writeFileSync(
      './scripts/smoke-results.json',
      JSON.stringify({ summary, results }, null, 2)
    );
    fs.writeFileSync(
      './scripts/smoke-report.md',
      [
        '# HRMS API Smoke Test Report',
        '',
        `- Run ID: \`${prefix}\``,
        `- Base URL: \`${baseUrl}\``,
        '',
        '## Failures',
        '',
        `- Unhandled error: ${error.message}`,
        '',
      ].join('\n')
    );
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
