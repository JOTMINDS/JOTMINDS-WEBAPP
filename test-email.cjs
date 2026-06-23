const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "service@jotminds.com",
      pass: "Service@0248838540",
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"JotMinds Support" <service@jotminds.com>',
      to: "kwabenabrefo@gmail.com", // use random or fake
      subject: "Test",
      text: "Test"
    });
    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
