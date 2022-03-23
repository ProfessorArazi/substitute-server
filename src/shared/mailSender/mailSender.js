const nodemailer = require("nodemailer");

const mailSender = (client, html) => {
  let subject = "התראה חדשה";
  const mail = process.env.MAIL;

  const transporter = nodemailer.createTransport({
    service: "gmail",
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
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
  });
};

module.exports = mailSender;
