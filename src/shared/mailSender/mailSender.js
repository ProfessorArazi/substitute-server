const nodemailer = require("nodemailer");

const mailSender = (client, html) => {
  const ameatEmail = "ameatrest@gmail.com";
  let subject = "התראה חדשה";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ameatEmail,
      pass: "Amit1122",
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
