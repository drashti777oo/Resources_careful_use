import process from 'process';

const base = 'http://localhost:5000';
const headers = (token) => ({ 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' });
const log = (name, ok, detail) => {
  const result = { name, ok, detail };
  console.log(JSON.stringify(result));
  return result;
};

const req = async (path, opts = {}) => {
  const res = await fetch(base + path, opts);
  let body;
  try {
    body = await res.json();
  } catch (error) {
    body = { text: await res.text() };
  }
  return { status: res.status, body };
};

const makeUser = (role) => ({
  name: `${role} Tester`,
  email: `${role.toLowerCase()}-dept-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
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
    const ok = login.status === 200 && login.body?.data?.token;
    results.push(log(`login-${role}`, Boolean(ok), login));
    if (ok) {
      user.token = login.body.data.token;
      user.id = login.body.data.user.id;
    }
  }

  const deptData = [
    { name: `Engineering ${Date.now()}`, description: 'Engineering department', status: 'Active' },
    { name: `Sales ${Date.now()}`, description: 'Sales team', status: 'Inactive' },
  ];

  const created = [];

  const createDepartment = async (token, data) =>
    req('/api/departments', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data),
    });

  const createAdmin = await createDepartment(creds.Admin.token, deptData[0]);
  results.push(log('create-admin', createAdmin.status === 201, createAdmin));
  if (createAdmin.status === 201) created.push({ id: createAdmin.body.data._id, ...deptData[0] });

  const createHr = await createDepartment(creds.HR.token, deptData[1]);
  results.push(log('create-hr', createHr.status === 201, createHr));
  if (createHr.status === 201) created.push({ id: createHr.body.data._id, ...deptData[1] });

  const createEmployee = await createDepartment(creds.Employee.token, { name: `Support ${Date.now()}`, description: 'Support', status: 'Active' });
  results.push(log('create-employee', createEmployee.status === 403, createEmployee));

  const listAll = await req('/api/departments', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('list-departments', listAll.status === 200, listAll));

  const page = await req('/api/departments?page=1&limit=1', {
    headers: headers(creds.Admin.token),
  });
  const pageOk = page.status === 200 && page.body.data?.pagination?.limit === 1;
  results.push(log('pagination', pageOk, page));

  const search = await req(`/api/departments?search=${encodeURIComponent(deptData[0].name.split(' ')[0])}`, {
    headers: headers(creds.Admin.token),
  });
  const searchOk = search.status === 200 && Array.isArray(search.body.data?.departments) && search.body.data.departments.some((d) => d.name === deptData[0].name);
  results.push(log('search', searchOk, search));

  const statusFilter = await req(`/api/departments?status=${encodeURIComponent(deptData[1].status)}`, {
    headers: headers(creds.Admin.token),
  });
  const statusOk = statusFilter.status === 200 && Array.isArray(statusFilter.body.data?.departments) && statusFilter.body.data.departments.every((d) => d.status === deptData[1].status);
  results.push(log('status-filter', statusOk, statusFilter));

  if (created.length > 0) {
    const valid = await req(`/api/departments/${created[0].id}`, {
      headers: headers(creds.Admin.token),
    });
    results.push(log('get-valid', valid.status === 200, valid));

    const invalid = await req('/api/departments/000000000000000000000000', {
      headers: headers(creds.Admin.token),
    });
    results.push(log('get-invalid', invalid.status === 404, invalid));

    const updateAdmin = await req(`/api/departments/${created[0].id}`, {
      method: 'PUT',
      headers: headers(creds.Admin.token),
      body: JSON.stringify({ description: 'Engineering updated' }),
    });
    results.push(log('update-admin', updateAdmin.status === 200, updateAdmin));

    const updateHr = await req(`/api/departments/${created[1].id}`, {
      method: 'PUT',
      headers: headers(creds.HR.token),
      body: JSON.stringify({ description: 'Sales updated' }),
    });
    results.push(log('update-hr', updateHr.status === 200, updateHr));

    const updateEmployee = await req(`/api/departments/${created[0].id}`, {
      method: 'PUT',
      headers: headers(creds.Employee.token),
      body: JSON.stringify({ description: 'Bad update' }),
    });
    results.push(log('update-employee', updateEmployee.status === 403, updateEmployee));

    const deleteAdmin = await req(`/api/departments/${created[0].id}`, {
      method: 'DELETE',
      headers: headers(creds.Admin.token),
    });
    results.push(log('delete-admin', deleteAdmin.status === 200, deleteAdmin));

    const deleteHr = await req(`/api/departments/${created[1].id}`, {
      method: 'DELETE',
      headers: headers(creds.HR.token),
    });
    results.push(log('delete-hr', deleteHr.status === 200, deleteHr));

    const deleteEmployee = await req(`/api/departments/${created[0].id}`, {
      method: 'DELETE',
      headers: headers(creds.Employee.token),
    });
    results.push(log('delete-employee', deleteEmployee.status === 403, deleteEmployee));
  } else {
    const failure = { status: 500, body: { success: false, message: 'No departments created' } };
    results.push(log('get-valid', false, failure));
    results.push(log('get-invalid', false, failure));
    results.push(log('update-admin', false, failure));
    results.push(log('update-hr', false, failure));
    results.push(log('update-employee', false, failure));
    results.push(log('delete-admin', false, failure));
    results.push(log('delete-hr', false, failure));
    results.push(log('delete-employee', false, failure));
  }

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((err) => {
  console.error('TEST_ERROR', err);
  process.exit(1);
});
