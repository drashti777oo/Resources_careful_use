import streamifier from 'streamifier';
import cloudinary from '../config/cloudinaryConfig.js';
import { successResponse, errorResponse } from '../utils/response.js';

const uploadToCloudinary = (req, res, options, successMessage, responseData) => {
  const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) {
      return errorResponse(res, 500, 'Cloudinary upload failed', error.message);
    }

    return successResponse(res, 200, successMessage, responseData(result));
  });

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'No file uploaded');
  }

  try {
    return uploadToCloudinary(
      req,
      res,
      {
        folder: 'hrms/profile_pictures',
        resource_type: 'image',
      },
      'Profile picture uploaded successfully',
      (result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      })
    );
  } catch (error) {
    return errorResponse(res, 500, 'Upload failed', error.message);
  }
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'No file uploaded');
  }

  try {
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
    return uploadToCloudinary(
      req,
      res,
      {
        folder: 'hrms/documents',
        resource_type: resourceType,
      },
      'Document uploaded successfully',
      (result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
      })
    );
  } catch (error) {
    return errorResponse(res, 500, 'Upload failed', error.message);
  }
};
