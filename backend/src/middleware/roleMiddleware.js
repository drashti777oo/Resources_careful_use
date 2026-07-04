import { ROLE_LEVELS } from '../constants/roles.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (roles.length === 0) {
      return next();
    }

    const allowed = roles.some((role) => {
      const normRole = role ? role.toUpperCase().trim() : '';
      const normUserRole = userRole ? userRole.toUpperCase().trim() : '';

      if (!ROLE_LEVELS[normRole] || !ROLE_LEVELS[normUserRole]) {
        return false;
      }
      return ROLE_LEVELS[normUserRole] >= ROLE_LEVELS[normRole];
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    next();
  };
};
