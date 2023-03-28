const nodemailer = require("nodemailer");

const mailSender = async (client, html) => {
  let subject = "התראה חדשה";
  const mail = process.env.MAIL;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: mail,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: mail,
    to: client,
    subject,
    html,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else resolve("email sent");
    });
  });
};

module.exports = mailSender;
