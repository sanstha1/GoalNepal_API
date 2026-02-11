import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const mailOptions = {
    from: `GoalNepal <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Transporter Error:", error);
//   } else {
//     console.log("Email server ready");
//   }
// });

