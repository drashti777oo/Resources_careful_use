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
  let body;
  try {
    body = await res.json();
  } catch (e) {
    body = { text: await res.text() };
  }
  return { status: res.status, body };
};

const makeUser = (role) => ({
  name: `${role} Tester`,
  email: `${role.toLowerCase()}-att-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
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

  const employees = [];
  const createEmployee = async (role) => {
    const data = {
      employeeId: `ATT-${Date.now()}-${role}`,
      user: creds[role].id,
      firstName: `${role}`,
      lastName: 'Attendance',
      department: 'HR',
      status: 'Active',
    };
    const res = await req('/api/employees', {
      method: 'POST',
      headers: headers(creds.Admin.token),
      body: JSON.stringify(data),
    });
    results.push(log(`employee-create-${role}`, res.status === 201, res));
    if (res.status === 201) {
      employees.push({ role, ...data, id: res.body.data._id });
    }
  };

  await createEmployee('Admin');
  await createEmployee('HR');
  await createEmployee('Employee');

  if (!creds.Employee.token) {
    results.push(log('setup-failure', false, 'No employee token')); 
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const checkIn = await req('/api/attendance/checkin', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({ employee: employees.find((e) => e.role === 'Employee')?.id }),
  });
  results.push(log('checkin-employee', checkIn.status === 200, checkIn));

  const duplicateCheckIn = await req('/api/attendance/checkin', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({ employee: employees.find((e) => e.role === 'Employee')?.id }),
  });
  results.push(log('duplicate-checkin', duplicateCheckIn.status === 400, duplicateCheckIn));

  const checkoutFail = await req('/api/attendance/checkout', {
    method: 'POST',
    headers: headers(creds.HR.token),
    body: JSON.stringify({ employee: employees.find((e) => e.role === 'HR')?.id }),
  });
  results.push(log('checkout-before-checkin', checkoutFail.status === 400, checkoutFail));

  const checkOut = await req('/api/attendance/checkout', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({ employee: employees.find((e) => e.role === 'Employee')?.id }),
  });
  results.push(log('checkout-employee', checkOut.status === 200, checkOut));

  const myAttendance = await req('/api/attendance/me', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('my-attendance', myAttendance.status === 200, myAttendance));

  const allAttendance = await req('/api/attendance', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('all-attendance', allAttendance.status === 200, allAttendance));

  const pagination = await req('/api/attendance?page=1&limit=1', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('attendance-pagination', pagination.status === 200 && pagination.body.data?.pagination?.limit === 1, pagination));

  const statusFilter = await req('/api/attendance?status=Present', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('attendance-status-filter', statusFilter.status === 200, statusFilter));

  const search = await req(`/api/attendance?search=${encodeURIComponent('Employee')}`, {
    headers: headers(creds.Admin.token),
  });
  results.push(log('attendance-search', search.status === 200, search));

  const deptFilter = await req('/api/attendance?department=HR', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('attendance-department-filter', deptFilter.status === 200, deptFilter));

  const attendanceId = checkOut.body.data?._id;
  if (attendanceId) {
    const update = await req(`/api/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: headers(creds.HR.token),
      body: JSON.stringify({ remarks: 'Updated by HR' }),
    });
    results.push(log('attendance-update', update.status === 200, update));

    const deleteRes = await req(`/api/attendance/${attendanceId}`, {
      method: 'DELETE',
      headers: headers(creds.HR.token),
    });
    results.push(log('attendance-delete', deleteRes.status === 200, deleteRes));
  } else {
    results.push(log('attendance-update', false, 'Missing attendance id'));
    results.push(log('attendance-delete', false, 'Missing attendance id'));
  }

  const unauthorizedView = await req('/api/attendance', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('attendance-unauthorized-view', unauthorizedView.status === 403, unauthorizedView));

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
