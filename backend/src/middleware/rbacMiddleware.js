import { ROLE_LEVELS } from '../constants/roles.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    const allowed = allowedRoles.some((role) => ROLE_LEVELS[userRole] >= ROLE_LEVELS[role]);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
  };
};

export const requireSameOrAbove = (minimumRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || ROLE_LEVELS[userRole] < ROLE_LEVELS[minimumRole]) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};
