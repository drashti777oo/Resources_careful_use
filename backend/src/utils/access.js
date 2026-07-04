import Employee from '../models/Employee.js';

export const getEmployeeScopeFilter = (user) => {
  const role = user?.role?.toUpperCase();
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'HR':
      return {};
    case 'MANAGER':
      return { manager: user.id };
    case 'EMPLOYEE':
      return { user: user.id };
    default:
      return { _id: null };
  }
};

export const canAccessEmployee = async (user, employeeId) => {
  if (!user) {
    return false;
  }

  const role = user.role?.toUpperCase();
  if (['SUPER_ADMIN', 'ADMIN', 'HR'].includes(role)) {
    return true;
  }

  const employee = await Employee.findById(employeeId).select('user manager');
  if (!employee) {
    return false;
  }

  if (role === 'MANAGER') {
    return employee.manager?.toString() === user.id;
  }

  if (role === 'EMPLOYEE') {
    return employee.user?.toString() === user.id;
  }

  return false;
};

export const isTeamMember = async (user, employeeId) => {
  const role = user?.role?.toUpperCase();
  if (role !== 'MANAGER') {
    return false;
  }

  const employee = await Employee.findById(employeeId).select('manager');
  return employee?.manager?.toString() === user.id;
};
