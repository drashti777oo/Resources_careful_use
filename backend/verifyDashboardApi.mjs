import process from 'process';

const base = 'http://localhost:5000';
const headers = (token) => ({ 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' });
const log = (name, ok, detail) => {
  const entry = { name, ok, detail };
  console.log(JSON.stringify(entry));
  return entry;
};

const req = async (path, opts = {}) => {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (err) {
    body = { text };
  }
  return { status: res.status, body };
};

const makeUser = (role) => ({
  name: `${role} Tester`,
  email: `${role.toLowerCase()}-dashboard-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'Secret1!',
  role,
});

const test = async () => {
  const roles = ['Admin', 'HR', 'Employee'];
  const creds = {};
  const results = [];

  for (const role of roles) {
    const user = makeUser(role);
    const register = await req('/api/auth/register', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(user),
    });
    results.push(log(`register-${role}`, register.status === 201, register));
    creds[role] = user;
  }

  for (const role of roles) {
    const user = creds[role];
    const login = await req('/api/auth/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    const ok = login.status === 200 && login.body.data?.token;
    results.push(log(`login-${role}`, Boolean(ok), login));
    if (ok) {
      user.token = login.body.data.token;
      user.id = login.body.data.user.id;
    }
  }

  const createEmployee = async (role, department, status = 'Active') => {
    const payload = {
      employeeId: `DASH-${Date.now()}-${role}`,
      user: creds[role].id,
      firstName: role,
      lastName: 'Dashboard',
      department,
      status,
    };
    const res = await req('/api/employees', {
      method: 'POST',
      headers: headers(creds.Admin.token),
      body: JSON.stringify(payload),
    });
    results.push(log(`employee-create-${role}`, res.status === 201, res));
    return res.body.data;
  };

  const adminEmp = await createEmployee('Admin', 'Finance');
  const hrEmp = await createEmployee('HR', 'Finance');
  const empEmp = await createEmployee('Employee', 'IT');

  const attendanceDate = new Date();
  const today = attendanceDate.toISOString();

  await req('/api/attendance/checkin', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({ employee: empEmp._id }),
  });

  await req('/api/attendance/checkin', {
    method: 'POST',
    headers: headers(creds.Admin.token),
    body: JSON.stringify({ employee: adminEmp._id }),
  });

  const leave = await req('/api/leaves', {
    method: 'POST',
    headers: headers(creds.Admin.token),
    body: JSON.stringify({ employee: hrEmp._id, leaveType: 'Paid', startDate: today, endDate: today, reason: 'Dashboard leave' }),
  });
  results.push(log('create-leave', leave.status === 201, leave));

  const payroll = await req('/api/payroll', {
    method: 'POST',
    headers: headers(creds.HR.token),
    body: JSON.stringify({ employee: empEmp._id, month: attendanceDate.getMonth() + 1, year: attendanceDate.getFullYear(), basicSalary: 1000 }),
  });
  results.push(log('create-payroll', payroll.status === 201, payroll));

  const stats = await req('/api/dashboard/stats', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('dashboard-stats', stats.status === 200, stats));

  const unauthorized = await req('/api/dashboard/stats', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('dashboard-unauthorized', unauthorized.status === 403, unauthorized));

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
