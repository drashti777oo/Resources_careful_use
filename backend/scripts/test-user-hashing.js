import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

const run = async () => {
  await connectDB();

  const email = `hash-test-${Date.now()}@example.com`;
  const plainPassword = 'StrongPassword123';

  const user = new User({
    name: 'Hash Test User',
    email,
    password: plainPassword,
    role: 'Employee',
  });

  await user.save();

  console.log('Stored password hash:', user.password);
  console.log('comparePassword(correct):', await user.comparePassword(plainPassword));
  console.log('comparePassword(incorrect):', await user.comparePassword('wrong-password'));

  await User.deleteOne({ _id: user._id });
  console.log('Cleanup complete');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
