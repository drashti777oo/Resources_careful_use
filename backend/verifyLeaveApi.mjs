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
  email: `${role.toLowerCase()}-leave-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
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
      employeeId: `LEAVE-${Date.now()}-${role}`,
      user: creds[role].id,
      firstName: role,
      lastName: 'Leave',
      department: 'HR',
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

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const apply = await req('/api/leaves', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({
      employee: employee.id,
      leaveType: 'Paid',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason: 'Vacation',
    }),
  });
  results.push(log('apply-leave', apply.status === 201, apply));

  const applyInvalid = await req('/api/leaves', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({
      employee: employee.id,
      leaveType: 'InvalidType',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });
  results.push(log('apply-leave-invalid', applyInvalid.status >= 400, applyInvalid));

  const myLeaves = await req('/api/leaves/me', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('my-leaves', myLeaves.status === 200, myLeaves));

  const allLeaves = await req('/api/leaves', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('all-leaves', allLeaves.status === 200, allLeaves));

  const pagination = await req('/api/leaves?page=1&limit=1', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('pagination', pagination.status === 200 && pagination.body.data?.pagination?.limit === 1, pagination));

  const statusFilter = await req('/api/leaves?status=Pending', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('status-filter', statusFilter.status === 200, statusFilter));

  const typeFilter = await req('/api/leaves?leaveType=Paid', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('type-filter', typeFilter.status === 200, typeFilter));

  const search = await req(`/api/leaves?search=${encodeURIComponent('Employee')}`, {
    headers: headers(creds.Admin.token),
  });
  results.push(log('search', search.status === 200, search));

  const leaveId = apply.body.data?._id;
  if (leaveId) {
    const approve = await req(`/api/leaves/${leaveId}/approve`, {
      method: 'PUT',
      headers: headers(creds.HR.token),
    });
    results.push(log('approve-leave', approve.status === 200, approve));

    const reject = await req(`/api/leaves/${leaveId}/reject`, {
      method: 'PUT',
      headers: headers(creds.HR.token),
      body: JSON.stringify({ comments: 'Not enough leave balance' }),
    });
    results.push(log('reject-leave', reject.status === 200, reject));

    const cancel = await req(`/api/leaves/${leaveId}/cancel`, {
      method: 'PUT',
      headers: headers(creds.Employee.token),
    });
    results.push(log('cancel-leave', cancel.status === 200, cancel));

    const deleteRes = await req(`/api/leaves/${leaveId}`, {
      method: 'DELETE',
      headers: headers(creds.HR.token),
    });
    results.push(log('delete-leave', deleteRes.status === 200, deleteRes));
  } else {
    results.push(log('approve-leave', false, 'Missing leave ID'));
    results.push(log('reject-leave', false, 'Missing leave ID'));
    results.push(log('cancel-leave', false, 'Missing leave ID'));
    results.push(log('delete-leave', false, 'Missing leave ID'));
  }

  const unauthorized = await req('/api/leaves', {
    headers: headers(creds.Employee.token),
  });
  results.push(log('unauthorized-view', unauthorized.status === 403, unauthorized));

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
