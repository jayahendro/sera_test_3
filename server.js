// "use strict";
// const nodemailer = require("nodemailer");

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {
//   // Generate test SMTP service account from ethereal.email
//   // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: 'orval9@ethereal.email', // generated ethereal user
//       pass: 'pRNg2zVfkk5BePXTN8', // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '"JayaTesting" <info@jayatesting.com>', // sender address
//     to: "xlilx.night@gmail.com", // list of receivers
//     subject: "Helloooo", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

// main().catch(console.error);

const amqp = require('amqplib/callback_api');
const nodemailer = require("nodemailer");
require('dotenv').config();

amqp.connect(`${process.env.RABBITMQ_CONNECTION}://${process.env.RABBITMQ_HOST}`, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = 'email';

    channel.assertQueue(queue, {
      durable: false
    });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

    channel.consume(queue, (msg) => {
      console.log(' [x] Received %s', msg.content.toString());

      const sendEmail = async (mailDetails) => {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        try {
          await transporter.sendMail(mailDetails);
          console.log(` [✔] Email sent successfully to ${mailDetails.to}`);
        } catch (error) {
          console.log(" [x] Failed to send email!");
        }
      }

      sendEmail({
        from: `"JayaTesting" <${process.env.MAIL_USERNAME}>`,
        to: msg.content.toString(),
        subject: "Success to add user",
        text: "Hi, there... You're success to add user from API! Good Luck..."
      });
    }, {
      noAck: true
    });
  });
});