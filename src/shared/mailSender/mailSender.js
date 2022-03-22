const nodemailer = require("nodemailer");

const mailSender = (client, html) => {
  let subject = "התראה חדשה";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: ameatEmail,
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
