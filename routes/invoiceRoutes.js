const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const logoPath = path.join(__dirname, "../assets/logo.png");
const invoiceFolder = path.join(__dirname, "../invoices");

console.log("INVOICE ROUTES LOADED");

/* =========================================================
   GENERATE INVOICE FUNCTION
========================================================= */

async function generateInvoice({
  bookingId,
  studentName,
  studentPhone,
  tutorName,
  subject,
  mode,
  amount
}) {
  try {
    /* ================= VALIDATION ================= */

    if (
      !bookingId ||
      !studentName ||
      !studentPhone ||
      !tutorName ||
      !subject ||
      !mode ||
      amount == null
    ) {
      throw new Error("Missing required invoice fields");
    }

    /* ================= CREATE FOLDER ================= */

    fs.mkdirSync(invoiceFolder, {
      recursive: true
    });

    /* ================= FILE NAME ================= */

    const invoiceName = `invoice_${bookingId}.pdf`;

    const invoicePath = path.join(
      invoiceFolder,
      invoiceName
    );

    /* ================= PDF START ================= */

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    const writeStream =
      fs.createWriteStream(invoicePath);

    doc.pipe(writeStream);

    /* =====================================================
       HEADER
    ===================================================== */

    doc
      .rect(0, 0, 612, 110)
      .fill("#1a73e8");

    /* ================= LOGO ================= */

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 15, {
        width: 80
      });
    }

    /* ================= BRAND ================= */

    doc
      .fillColor("white")
      .fontSize(26)
      .text("TutorCall", 140, 30);

    doc
      .fontSize(12)
      .text(
        "Professional Home Tutor Services",
        140,
        65
      );

    /* =====================================================
       INVOICE TITLE
    ===================================================== */

    doc
      .moveDown(3)
      .strokeColor("#1a73e8")
      .lineWidth(2)
      .moveTo(50, 125)
      .lineTo(550, 125)
      .stroke();

    doc.moveDown(3);

    doc
      .fontSize(18)
      .fillColor("#000")
      .text("PAYMENT INVOICE", {
        align: "center"
      });

    doc.moveDown(1.5);

    /* =====================================================
       INVOICE INFORMATION
    ===================================================== */

    const now = new Date();

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(`Invoice ID : ${bookingId}`)
      .text(
        `Invoice Date : ${now.toLocaleDateString()}`
      )
      .text(
        `Invoice Time : ${now.toLocaleTimeString()}`
      );

    /* =====================================================
       WATERMARK
    ===================================================== */

    doc.save();

    doc.rotate(-45, {
      origin: [300, 350]
    });

    doc
      .fillColor("#eeeeee")
      .fontSize(70)
      .text(
        "TUTORCALL",
        120,
        320
      );

    doc.restore();

    /* =====================================================
       STUDENT DETAILS
    ===================================================== */

    doc.moveDown(2);

    doc
      .fontSize(15)
      .fillColor("#1a73e8")
      .text("Student Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(
        `Student Name : ${studentName}`
      )
      .text(
        `Mobile Number : ${studentPhone}`
      );

    /* =====================================================
       TUTOR DETAILS
    ===================================================== */

    doc.moveDown(1.5);

    doc
      .fontSize(15)
      .fillColor("#1a73e8")
      .text("Tutor Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text(
        `Tutor Name : ${tutorName}`
      )
      .text(
        `Subject : ${subject}`
      )
      .text(
        `Class Mode : ${mode}`
      );

    /* =====================================================
       PAYMENT DETAILS
    ===================================================== */

    const y = doc.y;

    doc
      .roundedRect(
        50,
        y,
        500,
        60,
        10
      )
      .fillAndStroke(
        "#e8f5e9",
        "#4caf50"
      );

    doc
      .fillColor("#000")
      .fontSize(15)
      .text(
        `Amount Paid : INR ${amount}`,
        70,
        y + 18
      );

    doc
      .fillColor("#2e7d32")
      .fontSize(15)
      .text(
        "PAYMENT SUCCESSFUL",
        320,
        y + 18
      );

    /* =====================================================
       FOOTER
    ===================================================== */

    doc
      .fontSize(10)
      .fillColor("#777")
      .text(
        "Thank you for choosing TutorCall.",
        50,
        720,
        {
          align: "center",
          width: 500
        }
      );

    /* =====================================================
       END PDF
    ===================================================== */

    doc.end();

    /* Wait until PDF file is completely written */

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log(
      "Invoice generated:",
      invoicePath
    );

    return {
      file: invoiceName,
      url: `/api/booking/download-invoice/${invoiceName}`
    };

  } catch (error) {

    console.error(
      "GENERATE INVOICE ERROR:",
      error
    );

    throw error;
  }
}


/* =========================================================
   COMPLETE BOOKING + GENERATE INVOICE
========================================================= */

router.post(
  "/booking/complete-booking",
  async (req, res) => {

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
        amount == null
      ) {

        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });

      }

      /* ================= GENERATE ================= */

      const invoice =
        await generateInvoice({
          bookingId,
          studentName,
          studentPhone,
          tutorName,
          subject,
          mode,
          amount
        });

      /* ================= RESPONSE ================= */

      return res.json({

        success: true,

        message:
          "Invoice generated successfully",

        invoiceUrl:
          invoice.url,

        invoiceFile:
          invoice.file

      });

    } catch (error) {

      console.error(
        "Invoice Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Invoice generation failed"

      });

    }

  }
);


/* =========================================================
   DOWNLOAD INVOICE
========================================================= */

router.get(
  "/booking/download-invoice/:file",
  (req, res) => {

    try {

      const fileName =
        path.basename(req.params.file);

      const filePath =
        path.join(
          invoiceFolder,
          fileName
        );

      console.log(
        "Downloading Invoice:",
        filePath
      );

      /* ================= CHECK FILE ================= */

      if (!fs.existsSync(filePath)) {

        return res.status(404).json({

          success: false,

          message:
            "Invoice file not found"

        });

      }

      /* ================= DOWNLOAD ================= */

      return res.download(
        filePath,
        fileName
      );

    } catch (error) {

      console.error(
        "Invoice Download Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Download failed"

      });

    }

  }
);


/* =========================================================
   INVOICE LIST
========================================================= */

router.get(
  "/booking/invoices",
  (req, res) => {

    try {

      console.log(
        "Invoice Folder:",
        invoiceFolder
      );

      /* ================= CHECK FOLDER ================= */

      if (!fs.existsSync(invoiceFolder)) {

        return res.json({

          success: true,

          invoices: []

        });

      }

      /* ================= READ FILES ================= */

      const files =
        fs.readdirSync(invoiceFolder);

      console.log(
        "Invoice Files:",
        files
      );

      /* ================= CREATE LIST ================= */

      const invoices =
        files

          .filter(
            file =>
              file.toLowerCase().endsWith(".pdf")
          )

          .map(file => {

            const fullPath =
              path.join(
                invoiceFolder,
                file
              );

            const stats =
              fs.statSync(fullPath);

            return {

              file: file,

              url:
                `/api/booking/download-invoice/${encodeURIComponent(file)}`,

              date:
                stats.mtime

            };

          })

          .sort(
            (a, b) =>
              new Date(b.date) -
              new Date(a.date)
          );

      /* ================= RESPONSE ================= */

      return res.json({

        success: true,

        invoices

      });

    } catch (error) {

      console.error(
        "Invoice List Error:",
        error
      );

      return res.status(500).json({

        success: false,

        invoices: [],

        message:
          "Failed to load invoices"

      });

    }

  }
);


/* =========================================================
   EXPORT FUNCTION + ROUTER
========================================================= */

router.generateInvoice =
  generateInvoice;

module.exports = router;