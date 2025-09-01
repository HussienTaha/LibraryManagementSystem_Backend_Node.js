import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // حط هنا إيميلك
      pass: process.env.PASSWORD, // حط هنا App Password
    },
  });

  const info = await transporter.sendMail({
    from: `"eng_hussien_taha" ${process.env.EMAIL}`, // نفس الإيميل
    to: to || "hussien1111258@gmail.com",

    subject:subject|| "test email",
    html:html||  "<b> hello world ? </b>",
    attachments: attachments || [],
  });
  if (info.accepted.length > 0) {
    return true;
  } else return false;
};
