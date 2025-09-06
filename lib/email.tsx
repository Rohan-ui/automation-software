import nodemailer from "nodemailer"

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
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: "pbind4545@gmail.com",
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: "pbind4545@gmail.com",
    to: email,
    subject: "Welcome to Post Management System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Post Management System!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created. You can now log in and start managing your social media posts.</p>
        <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Welcome email sending failed:", error)
    return { success: false, error: error.message }
  }
}
