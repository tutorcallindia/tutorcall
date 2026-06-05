const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* ================= COMPLETE BOOKING + GENERATE INVOICE ================= */
console.log("NEW INVOICE ROUTE RUNNING");
router.post("/booking/complete-booking", async (req, res) => {
  try {
    const {
      bookingId,
      studentName,
      studentPhone,
      tutorName,
      subject,
      mode,
      amount
    } = req.body;

    /* ================= VALIDATION ================= */

    if (
      !bookingId ||
      !studentName ||
      !studentPhone ||
      !tutorName ||
      !subject ||
      !mode ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    /* ================= CREATE INVOICE FOLDER ================= */

    const invoiceFolder = path.join(__dirname, "../invoices");

    fs.mkdirSync(invoiceFolder, { recursive: true });

    /* ================= FILE NAME ================= */

    const invoiceName = `invoice_${bookingId}.pdf`;

    const invoicePath = path.join(invoiceFolder, invoiceName);

    /* ================= PDF START ================= */

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    doc.pipe(fs.createWriteStream(invoicePath));

    /* ================= HEADER ================= */

    const logoPath = path.join(__dirname, "../assets/logo.png");
console.log("Logo Exists:", fs.existsSync(logoPath));
console.log("Logo Path:", logoPath);

    if (fs.existsSync(logoPath)) {
      console.log("Logo Path:", logoPath);
console.log("Logo Exists:", fs.existsSync(logoPath));
      
      doc.image(logoPath, 50, 40, {
        width: 70
      });
    }

    doc
      .fontSize(24)
      .fillColor("#1a73e8")
      .text("TutorCall", 140, 50);

    doc
      .fontSize(12)
      .fillColor("#666")
      .text("Professional Home Tutor Services", 140, 80);

    doc
      .moveDown(2)
      .strokeColor("#1a73e8")
      .lineWidth(2)
      .moveTo(50, 125)
      .lineTo(550, 125)
      .stroke();

    /* ================= INVOICE INFO ================= */

    doc.moveDown(3);

    doc
      .fontSize(18)
      .fillColor("#000")
      .text("PAYMENT INVOICE", {
        align: "center"
      });

    doc.moveDown(1.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(`Invoice ID : ${bookingId}`)
      .text(`Invoice Date : ${new Date().toLocaleDateString()}`)
      .text(`Invoice Time : ${new Date().toLocaleTimeString()}`);

    /* ================= STUDENT DETAILS ================= */

    doc.moveDown(2);

    doc
      .fontSize(15)
      .fillColor("#1a73e8")
      .text("Student Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(`Student Name : ${studentName}`)
      .text(`Mobile Number : ${studentPhone}`);

    /* ================= TUTOR DETAILS ================= */

    doc.moveDown(1.5);

    doc
      .fontSize(15)
      .fillColor("#1a73e8")
      .text("Tutor Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(`Tutor Name : ${tutorName}`)
      .text(`Subject : ${subject}`)
      .text(`Class Mode : ${mode}`);

    /* ================= PAYMENT DETAILS ================= */

    doc.moveDown(1.5);

    doc
      .fontSize(15)
      .fillColor("#1a73e8")
      .text("Payment Summary");

    doc.moveDown(0.8);

    doc
      .rect(50, doc.y, 500, 35)
      .fillAndStroke("#f5f9ff", "#1a73e8");

    doc
      .fillColor("#000")
      .fontSize(13)
      .text(`Amount Paid : ₹ ${amount}`, 70, doc.y - 27);

    doc
      .fillColor("green")
      .fontSize(13)
      .text("✔ PAYMENT SUCCESSFUL", 350, doc.y - 15);

    /* ================= FOOTER ================= */

    doc.moveDown(5);

    doc
      .fontSize(10)
      .fillColor("#777")
      .text(
        "Thank you for choosing TutorCall.\nThis is a computer generated invoice and does not require signature.",
        {
          align: "center"
        }
      );

    /* ================= END PDF ================= */

    doc.end();

    /* ================= RESPONSE ================= */

    return res.json({
      success: true,
      message: "Invoice generated successfully",
      invoiceUrl: `/api/booking/download-invoice/${invoiceName}`
    });

  } catch (error) {
    console.log("Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Invoice generation failed"
    });
  }
});

/* ================= DOWNLOAD INVOICE ================= */

router.get("/booking/download-invoice/:file", (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      "../invoices",
      req.params.file
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file not found"
      });
    }

    res.download(filePath);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Download failed"
    });
  }
});

module.exports = router;