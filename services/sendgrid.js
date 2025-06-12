import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();
const { SENDGRID_API_KEY, SENDGRID_SENDER_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async (to, verificationUrl) => {
  const msg = {
    from: SENDGRID_SENDER_EMAIL,
    to,
    subject: "Please confirm your email",
    text: `Click on the link to verify your account: ${verificationUrl}`,
    html: `<p>Click on the link to verify your account:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  try {
    return await sgMail.send(msg);
  } catch (err) {
    console.error("SendGrid error:", err.message);
  }
};
