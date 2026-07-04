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
  email: `${role.toLowerCase()}-test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'Secret1!',
  role,
});

const test = async () => {
  const users = ['Admin', 'HR', 'Employee'];
  const creds = {};
  const results = [];

  for (const role of users) {
    const user = makeUser(role);
    const register = await req('/api/auth/register', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(user),
    });
    results.push(log(`register-${role}`, register.status === 201, register));
    creds[role] = user;
  }

  for (const role of users) {
    const user = creds[role];
    const login = await req('/api/auth/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    const ok = login.status === 200 && login.body?.data?.token;
    results.push(log(`login-${role}`, ok, login));
    if (ok) {
      user.token = login.body.data.token;
      user.id = login.body.data.user.id;
    }
  }

  const employeeData = [
    {
      employeeId: `EMP-${Date.now()}-A`,
      user: creds.Admin.id,
      firstName: 'Alice',
      lastName: 'Admin',
      department: 'Engineering',
      status: 'Active',
      salary: 70000,
      manager: creds.HR.id,
    },
    {
      employeeId: `EMP-${Date.now()}-H`,
      user: creds.HR.id,
      firstName: 'Bob',
      lastName: 'HR',
      department: 'Sales',
      status: 'Inactive',
      salary: 65000,
      manager: creds.Admin.id,
    },
  ];

  const created = [];

  for (const [index, data] of employeeData.entries()) {
    const role = index === 0 ? 'Admin' : 'HR';
    const res = await req('/api/employees', {
      method: 'POST',
      headers: headers(creds[role].token),
      body: JSON.stringify({
        ...data,
        phone: '555-0100',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        designation: 'Engineer',
        joiningDate: '2024-01-01',
        address: '123 Main St',
        emergencyContact: '555-9999',
        profilePicture: '',
      }),
    });
    const ok = res.status === 201;
    results.push(log(`create-${role}`, ok, res));
    if (ok) {
      created.push({ ...data, id: res.body.data._id, role });
    }
  }

  const employeeCreateByEmployee = await req('/api/employees', {
    method: 'POST',
    headers: headers(creds.Employee.token),
    body: JSON.stringify({
      employeeId: `EMP-${Date.now()}-E`,
      user: creds.Employee.id,
      firstName: 'Eve',
      lastName: 'Employee',
      phone: '555-0101',
      dateOfBirth: '1992-02-02',
      gender: 'Female',
      department: 'Support',
      designation: 'Assistant',
      joiningDate: '2024-02-01',
      salary: 50000,
      address: '456 Elm St',
      emergencyContact: '555-8888',
      profilePicture: '',
      status: 'Active',
      manager: creds.Admin.id,
    }),
  });
  results.push(log('create-employee', employeeCreateByEmployee.status === 403, employeeCreateByEmployee));

  const listAll = await req('/api/employees', {
    headers: headers(creds.Admin.token),
  });
  results.push(log('list-employees', listAll.status === 200, listAll));

  const pagination = await req('/api/employees?page=1&limit=1', {
    headers: headers(creds.Admin.token),
  });
  const pageOk = pagination.status === 200 && pagination.body.data?.pagination?.limit === 1;
  results.push(log('pagination', pageOk, pagination));

  const search = await req(`/api/employees?search=${encodeURIComponent(employeeData[0].firstName)}`, {
    headers: headers(creds.Admin.token),
  });
  const searchOk = search.status === 200 && Array.isArray(search.body.data?.employees) && search.body.data.employees.some((e) => e.firstName === employeeData[0].firstName);
  results.push(log('search', searchOk, search));

  const departmentFilter = await req(`/api/employees?department=${encodeURIComponent(employeeData[0].department)}`, {
    headers: headers(creds.Admin.token),
  });
  const departmentOk = departmentFilter.status === 200 && Array.isArray(departmentFilter.body.data?.employees) && departmentFilter.body.data.employees.every((e) => e.department === employeeData[0].department);
  results.push(log('department-filter', departmentOk, departmentFilter));

  const statusFilter = await req(`/api/employees?status=${encodeURIComponent(employeeData[0].status)}`, {
    headers: headers(creds.Admin.token),
  });
  const statusOk = statusFilter.status === 200 && Array.isArray(statusFilter.body.data?.employees) && statusFilter.body.data.employees.every((e) => e.status === employeeData[0].status);
  results.push(log('status-filter', statusOk, statusFilter));

  if (created.length > 0) {
    const valid = await req(`/api/employees/${created[0].id}`, {
      headers: headers(creds.Admin.token),
    });
    results.push(log('get-valid', valid.status === 200, valid));

    const invalid = await req('/api/employees/000000000000000000000000', {
      headers: headers(creds.Admin.token),
    });
    results.push(log('get-invalid', invalid.status === 404, invalid));

    const updateAdmin = await req(`/api/employees/${created[0].id}`, {
      method: 'PUT',
      headers: headers(creds.Admin.token),
      body: JSON.stringify({ designation: 'Lead Engineer' }),
    });
    results.push(log('update-admin', updateAdmin.status === 200, updateAdmin));

    const updateHr = await req(`/api/employees/${created[1].id}`, {
      method: 'PUT',
      headers: headers(creds.HR.token),
      body: JSON.stringify({ designation: 'Senior Sales' }),
    });
    results.push(log('update-hr', updateHr.status === 200, updateHr));

    const updateEmployee = await req(`/api/employees/${created[0].id}`, {
      method: 'PUT',
      headers: headers(creds.Employee.token),
      body: JSON.stringify({ designation: 'Bad Update' }),
    });
    results.push(log('update-employee', updateEmployee.status === 403, updateEmployee));

    const deleteAdmin = await req(`/api/employees/${created[0].id}`, {
      method: 'DELETE',
      headers: headers(creds.Admin.token),
    });
    results.push(log('delete-admin', deleteAdmin.status === 200, deleteAdmin));

    const deleteHr = await req(`/api/employees/${created[1].id}`, {
      method: 'DELETE',
      headers: headers(creds.HR.token),
    });
    results.push(log('delete-hr', deleteHr.status === 200, deleteHr));

    const deleteEmployee = await req(`/api/employees/${created[0].id}`, {
      method: 'DELETE',
      headers: headers(creds.Employee.token),
    });
    results.push(log('delete-employee', deleteEmployee.status === 403, deleteEmployee));
  } else {
    results.push(log('get-valid', false, 'No employee created')); 
    results.push(log('get-invalid', false, 'No employee created'));
    results.push(log('update-admin', false, 'No employee created'));
    results.push(log('update-hr', false, 'No employee created'));
    results.push(log('update-employee', false, 'No employee created'));
    results.push(log('delete-admin', false, 'No employee created'));
    results.push(log('delete-hr', false, 'No employee created'));
    results.push(log('delete-employee', false, 'No employee created'));
  }

  console.log('RESULT_SUMMARY');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

test().catch((err) => {
  console.error('TEST_ERROR', err);
  process.exit(1);
});
