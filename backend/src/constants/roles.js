export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LEVELS = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.HR]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1,
};

export const canAssignRole = (actorRole, targetRole) => {
  if (!actorRole || !targetRole) {
    return false;
  }
  return ROLE_LEVELS[actorRole] > ROLE_LEVELS[targetRole];
};

export const isRoleAtLeast = (currentRole, minimumRole) => {
  return ROLE_LEVELS[currentRole] >= ROLE_LEVELS[minimumRole];
};
