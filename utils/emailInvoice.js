const nodemailer = require("nodemailer");
const path = require("path");

async function sendInvoiceEmail({ to, studentName, invoicePath, bookingId }) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "YOUR_GMAIL@gmail.com",        // 👈 apna gmail
      pass: "YOUR_APP_PASSWORD"            // 👈 Gmail App Password
    }
  });

  const mailOptions = {
    from: `"TutorCall" <YOUR_GMAIL@gmail.com>`,
    to,
    subject: `TutorCall – Invoice for Booking #${bookingId}`,
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Your booking has been <b>successfully completed</b>.</p>
      <p>Please find your invoice attached with this email.</p>
      <br/>
      <p>Thanks & Regards,<br/>
      <b>TutorCall Team</b></p>
    `,
    attachments: [
      {
        filename: path.basename(invoicePath),
        path: invoicePath
      }
    ]
  };

 // await transporter.sendMail(mailOptions);
 console.log("✅ Invoice Email Disabled");
}

module.exports = sendInvoiceEmail;
