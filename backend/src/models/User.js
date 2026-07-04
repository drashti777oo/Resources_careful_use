import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
