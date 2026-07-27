const PDFDocument = require("pdfkit");

function generateInvoice(res, booking) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${booking._id}.pdf`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(20).text("TutorCall", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Invoice", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(11);
  doc.text(`Invoice ID: ${booking._id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(13).text("Student Details", { underline: true });
  doc.fontSize(11);
  doc.text(`Name: ${booking.studentName}`);
  doc.text(`Mobile: ${booking.studentPhone}`);
  doc.moveDown();

  doc.fontSize(13).text("Tutor Details", { underline: true });
  doc.fontSize(11);
  doc.text(`Name: ${booking.tutorName}`);
  doc.text(`Subject: ${booking.subject}`);
  doc.text(`Mode: ${booking.mode}`);
  doc.moveDown();

  doc.fontSize(13).text("Payment Summary", { underline: true });
  doc.fontSize(11);
  doc.text(`Amount Paid: ₹${booking.amount}`);
  doc.text("Payment Status: Completed");

  doc.moveDown(2);
  doc.fontSize(10).text("Thank you for using TutorCall!", {
    align: "center",
  });

  doc.end();
}

module.exports = generateInvoice;
