import nodemailer from 'nodemailer';

const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS environment variables for email delivery.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
};

export const sendVerificationEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your HRMS account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to HRMS</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold;">${otp}</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
