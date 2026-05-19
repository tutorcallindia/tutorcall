const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendInvoiceEmail = require("./emailInvoice");

module.exports = async function generateInvoice({
  bookingId,
  student,
  tutor,
  subject,
  mode,
  amount
}) {
  // folders
  const invoiceDir = path.join(__dirname, "../invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const fileName = `invoice_${bookingId}.pdf`;
  const filePath = path.join(invoiceDir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // logo
  const logoPath = path.join(__dirname, "../assets/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  doc.fontSize(22).text("TutorCall", 150, 50);
  doc.fontSize(14).fillColor("#555").text("INVOICE", 150, 80);
  doc.moveDown(3);

  // watermark
  const { width, height } = doc.page;
  doc.save();
  doc.opacity(0.08);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, width / 2 - 150, height / 2 - 150, { width: 300 });
  }
  doc.restore();

  doc.fillColor("#000").fontSize(12);
  doc.text(`Invoice ID: ${bookingId}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);

  doc.moveDown();
  doc.fontSize(13).text("Student Details", { underline: true });
  doc.fontSize(11).text(`Name: ${student.name}`);
  doc.text(`Phone: ${student.phone}`);
  if (student.email) doc.text(`Email: ${student.email}`);

  doc.moveDown();
  doc.fontSize(13).text("Tutor Details", { underline: true });
  doc.fontSize(11).text(`Name: ${tutor.name}`);
  doc.text(`Subject: ${subject}`);
  doc.text(`Mode: ${mode}`);

  doc.moveDown();
  doc.fontSize(13).text("Payment Summary", { underline: true });
  doc.fontSize(11).text(`Amount Paid: ₹${amount}`);
  doc.fillColor("green").text("Status: PAID");

  doc.moveDown(3);
  doc.fontSize(10).fillColor("#777").text(
    "Thank you for using TutorCall.\nThis is a system generated invoice.",
    { align: "center" }
  );

  doc.end();

  // wait till file is written
  await new Promise(res => stream.on("finish", res));

  // 📧 EMAIL
  if (student.email) {
    await sendInvoiceEmail({
      to: student.email,
      studentName: student.name,
      invoicePath: filePath,
      bookingId
    });
  }

  return { fileName, filePath };
};
