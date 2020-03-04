const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1. Create a Transporter
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in gmail 'less secure app' option
    // BTW: GMAIL is not really good option as mailer for production app,
    // you can send only 500 email per day and you can very quickly be marked
    // as spammer. So it's only good for private App 'MailTrap'
  });

  // 2. Define the email options
  const mailOption = {
    from: 'Mitendra Anand <hello@mitendra@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html: options.html
  };

  // 3. Actually send the email with nodemailer
  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
