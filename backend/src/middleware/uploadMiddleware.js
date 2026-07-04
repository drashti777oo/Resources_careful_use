import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPEG, PNG, JPG and PDF are allowed.'), false);
  }
};

export const uploadSingle = (fieldName) => {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single(fieldName);
};
