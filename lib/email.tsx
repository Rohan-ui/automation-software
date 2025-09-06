import nodemailer from "nodemailer"

// Create transporter with Gmail SMTP settings
const transporter = nodemailer.createTransporter({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "pbind4545@gmail.com",
    pass: "eptg xytk wsxe waet",
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: process.env.FROM_EMAIL || "pbind4545@gmail.com",
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your account. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated email from Post Management System.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Password reset email sent successfully")
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL || "pbind4545@gmail.com",
    to: email,
    subject: "Welcome to Post Management System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Post Management System!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created. You can now log in and start managing your social media posts.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signin" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Sign In</a>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated email from Post Management System.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Welcome email sent successfully")
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw new Error("Failed to send welcome email")
  }
}
