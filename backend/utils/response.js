export const successResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({ message, data });
};

export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ message });
};
