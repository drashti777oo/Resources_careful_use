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
  } catch (err) {
    body = { text: await res.text() };
  }
  return { status: res.status, body };
};

const makeUser = (role) => ({
  name: `${role} Tester`,
  email: `${role.toLowerCase()}-payroll-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
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
    const payload = {
      employeeId: `PAYROLL-${Date.now()}-${role}`,
      user: creds[role].id,
      firstName: role,
      lastName: 'Payroll',
      department: 'Finance',
      status: 'Active',
    };
    const res = await req('/api/employees', {
      method: 'POST',
      headers: headers(creds.Admin.token),
      body: JSON.stringify(payload),
    });
    results.push(log(`employee-create-${role}`, res.status === 201, res));
    if (res.status === 201) {
      employees.push({ ...payload, id: res.body.data._id, role });
    }
  };

  await createEmployee('Admin');
  await createEmployee('HR');
  await createEmployee('Employee');

  const employee = employees.find((e) => e.role === 'Employee');
  if (!employee) {
    results.push(log('setup-failure', false, 'Employee record missing'));
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const payload = {
    employee: employee.id,
    month: 7,
    year: 2026,
    basicSalary: 3000,
    allowances: 200,
    bonus: 150,
    deductions: 100,
    tax: 250,
    remarks: 'July payroll',
  };

  const generate = await req('/api/payroll', {
    method: 'POST',
    headers: headers(creds.HR.token),
    body: JSON.stringify(payload),
  });
  results.push(log('generate-payroll', generate.status === 201, generate));

  const duplicate = await req('/api/payroll', {
    method: 'POST',
    headers: headers(creds.HR.token),
    body: JSON.stringify(payload),
  });
  results.push(log('duplicate-payroll', duplicate.status === 409, duplicate));

  const generatedPayroll = generate.body.data;
  const expectedNet = payload.basicSalary + payload.allowances + payload.bonus - payload.deductions - payload.tax;
  results.push(log('net-salary-calc', generatedPayroll?.netSalary === expectedNet, { expected: expectedNet, actual: generatedPayroll?.netSalary }));

  const myPayroll = await req('/api/payroll/me', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('my-payroll', myPayroll.status === 200, myPayroll));

  const allPayroll = await req('/api/payroll', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('admin-payroll', allPayroll.status === 200, allPayroll));

  const pagination = await req('/api/payroll?page=1&limit=1', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('pagination', pagination.status === 200 && pagination.body.data?.pagination?.limit === 1, pagination));

  const statusFilter = await req('/api/payroll?paymentStatus=Pending', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('status-filter', statusFilter.status === 200, statusFilter));

  const monthFilter = await req('/api/payroll?month=7', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('month-filter', monthFilter.status === 200, monthFilter));

  const yearFilter = await req('/api/payroll?year=2026', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('year-filter', yearFilter.status === 200, yearFilter));

  const deptFilter = await req('/api/payroll?department=Finance', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('department-filter', deptFilter.status === 200, deptFilter));

  const pay = await req(`/api/payroll/${generatedPayroll._id}/pay`, {
    method: 'PUT',
    headers: headers(creds.Admin.token),
  });
  results.push(log('mark-paid', pay.status === 200 && pay.body.data?.paymentStatus === 'Paid', pay));

  const deleteRes = await req(`/api/payroll/${generatedPayroll._id}`, {
    method: 'DELETE',
    headers: headers(creds.HR.token),
  });
  results.push(log('delete-payroll', deleteRes.status === 200, deleteRes));

  const unauthorized = await req('/api/payroll', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('unauthorized-access', unauthorized.status === 403, unauthorized));

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
