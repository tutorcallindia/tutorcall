console.log("BOOKING ROUTE VERSION 15 JUNE");
console.log("BOOKING ROUTES FILE STARTED");
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendInvoiceEmail = require("../utils/emailInvoice");
const Booking = require("../models/booking");
const Review = require("../models/review");
const authTutor = require("../middleware/authTutor");
const sendBookingEmail =
require("../utils/sendBookingEmail");

const Tutor =
require("../models/tutor");
const sendWhatsApp =
require("../utils/sendWhatsApp");
// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------
router.get("/complete-booking", (req, res) => {
  res.send("BOOKING ROUTE WORKING");
});

// --------------------------------------------------
// COMPLETE BOOKING + GENERATE INVOICE + EMAIL
// --------------------------------------------------
router.post("/complete-booking", async (req, res) => {
   console.log("BOOKING PDF ROUTE RUNNING");
  try {
    const {
      bookingId,
      studentName,
      studentPhone,
      tutorName,
      subject,
      mode,
      amount,
      studentEmail   // 👈 frontend se bhejna
    } = req.body;

    // Ensure invoices folder exists
    const invoiceDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const invoiceFileName = `invoice_${bookingId}.pdf`;
    const invoicePath = path.join(invoiceDir, invoiceFileName);

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    /* ========== HEADER LOGO ========== */
    const logoPath = path.join(__dirname, "../assets/logo.png");
    console.log("Logo Path:", logoPath);
console.log("Logo Exists:", fs.existsSync(logoPath));
    
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 80 });
    }

    doc.fontSize(22).fillColor("#222").text("TutorCall", 150, 50);
    doc.fontSize(14).fillColor("#555").text("INVOICE", 150, 78);

    doc.moveDown(3);

    /* ========== WATERMARK ========== */
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.save();
    doc.opacity(0.08);
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, pageWidth / 2 - 150, pageHeight / 2 - 150, {
        width: 300
      });
    }
    doc.restore();

    doc.moveDown(2);

    /* ========== INVOICE DETAILS ========== */
    doc.fontSize(12).fillColor("#000");
    doc.text(`Invoice ID: ${bookingId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.fontSize(13).text("Student Details", { underline: true });
    doc.fontSize(11);
    doc.text(`Name: ${studentName}`);
    doc.text(`Mobile: ${studentPhone}`);

    doc.moveDown();
    doc.fontSize(13).text("Tutor Details", { underline: true });
    doc.fontSize(11);
    doc.text(`Name: ${tutorName}`);
    doc.text(`Subject: ${subject}`);
    doc.text(`Mode: ${mode}`);

    doc.moveDown();
    doc.fontSize(13).text("Payment Summary", { underline: true });
    doc.fontSize(11);
    doc.text(`Amount Paid: ₹${amount}`);
    doc.fillColor("green").text("Status: PAID ✔");

    doc.moveDown(3);
    doc.fontSize(10).fillColor("#777").text(
      "Thank you for using TutorCall.\nThis is a system generated invoice.",
      { align: "center" }
    );

    doc.end();

    // ✅ PDF COMPLETE → EMAIL + RESPONSE
    stream.on("finish", async () => {
      await sendInvoiceEmail({
        to: studentEmail || "test@example.com",
        studentName,
        invoicePath,
        bookingId
      });

      res.json({
        success: true,
        message: "Booking completed, invoice generated & emailed",
        invoiceUrl: `/api/booking/download-invoice/${invoiceFileName}`
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Booking completion failed"
    });
  }
});
// --------------------------------------------------
// GET ALL INVOICES FOR A STUDENT (by email)
// --------------------------------------------------

router.get("/invoices", async (req, res) => {
  try {

    const invoiceDir = path.join(__dirname, "../invoices");

    if (!fs.existsSync(invoiceDir)) {
      return res.json({
        success: true,
        invoices: []
      });
    }

    const files = fs.readdirSync(invoiceDir)
      .filter(f => f.endsWith(".pdf"))
      .map(f => ({
        file: f,
        url: `/api/booking/download-invoice/${f}`,
        date: fs.statSync(
          path.join(invoiceDir, f)
        ).mtime
      }))
      .sort((a,b) => b.date - a.date);

    res.json({
      success: true,
      invoices: files
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to load invoices"
    });

  }
});

// --------------------------------------------------
// DOWNLOAD INVOICE
// --------------------------------------------------
router.get("/download-invoice/:file", (req, res) => {
  const filePath = path.join(__dirname, "../invoices", req.params.file);
  res.download(filePath);
});
const authStudent = require("../middleware/authStudent");
// ---------------------------------------------
// CREATE BOOKING
// ---------------------------------------------
router.post("/create", authStudent, async (req, res) => {

  try {

    const {
      tutorId,
      schedule,
      message,
      amount
    } = req.body;

    // FIND TUTOR
    const tutor = await Tutor.findById(tutorId);

    // CREATE BOOKING
    const booking = await Booking.create({

      studentId: req.student._id,

      tutorId,

      schedule,

      message,

      amount,

      status: "Pending"

    });

    // SEND EMAILS
    await sendBookingEmail({

      studentEmail: req.student.email,

      tutorEmail: tutor.email,

      tutorName: tutor.name,

      studentName: req.student.name,

      amount

    });

    // RESPONSE
    res.json({

      success: true,
      message: "Booking Request Sent",
      booking

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Booking Failed"

    });

  }

});

/* =========================================
          TUTOR REVIEWS
========================================= */

router.get(
  "/my-reviews",

  authTutor,

  async (req, res) => {

    try {

      const reviews =
        await Review.find({

          tutorId:
            req.tutor._id

        })

        .populate(
          "studentId",
          "name"
        )

        .sort({
          createdAt: -1
        });

      res.json({

        success: true,
        reviews

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);
/* ======================================
        GET ALL BOOKINGS
====================================== */

router.get("/all", async (req, res) => {

  try {

    const bookings =
      await Booking.find()

      .populate(
        "studentId",
        "name"
      )

      .populate(
        "tutorId",
        "name"
      )

      .sort({
        createdAt: -1
      });

    res.json({

      success: true,
      bookings

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false

    });

  }

});
/* ======================================
        ACCEPT BOOKING
====================================== */

router.post("/accept/:id", async (req, res) => {

  try {

    const booking =
      await Booking.findById(req.params.id)

      .populate("studentId")
      .populate("tutorId");

    if (!booking) {

      return res.json({

        success: false,
        message: "Booking not found"

      });

    }

    booking.status = "Accepted";

    await booking.save();

    // WHATSAPP MESSAGE
    await sendWhatsApp(

      booking.studentId.phone,

      `🎉 Your booking has been accepted!

Tutor: ${booking.tutorId.name}

Amount: ₹${booking.amount}

TutorCall`
    );

    res.json({

      success: true,
      message: "Booking accepted successfully"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Accept failed"

    });

  }

});

/* ======================================
        COMPLETE BOOKING
====================================== */

router.post("/mark-complete/:id", async (req, res) => {

  try {

    const booking =
      await Booking.findById(req.params.id)

      .populate("studentId")
      .populate("tutorId");

    if (!booking) {

      return res.json({

        success: false,
        message: "Booking not found"

      });

    }

    booking.status = "Completed";

    await booking.save();

    // WHATSAPP MESSAGE
    await sendWhatsApp(

      booking.studentId.phone,

      `✅ Your class completed successfully.

Please give your review on TutorCall ⭐`
    );

    res.json({

      success: true,
      message: "Booking marked completed"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Complete failed"

    });

  }

});
router.get("/accept/:id", async (req, res) => {

  try {
 console.log(req.params.id);
    const booking =
      await Booking.findById(req.params.id)
      .populate("studentId")
      .populate("tutorId");
    console.log(booking);
    if (!booking) {

      return res.json({
        success: false,
        message: "Booking not found"
      });

    }

    booking.status = "Accepted";

    await booking.save();

    await sendWhatsApp(

      booking.studentId.phone,

      `🎉 Your booking has been accepted!

Tutor: ${booking.tutorId.name}

Amount: ₹${booking.amount}`

    );

    res.json({

      success: true,
      message: "Booking accepted successfully"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Accept failed"

    });

  }

});
router.get("/mark-complete/:id", async (req, res) => {

  try {

    const booking =
      await Booking.findById(req.params.id)
      .populate("studentId")
      .populate("tutorId");

    if (!booking) {

      return res.json({
        success: false,
        message: "Booking not found"
      });

    }

    booking.status = "Completed";

    await booking.save();

    await sendWhatsApp(

      booking.studentId.phone,

      `✅ Your class completed successfully.`

    );

    res.json({

      success: true,
      message: "Booking marked completed"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Complete failed"

    });

  }

});


/* ======================================
      TUTOR BOOKINGS
====================================== */

router.get(
  "/tutor-bookings",
  authTutor,
  async (req, res) => {

    try {

      const list =
        await Booking.find({

          tutorId: req.tutor._id

        })

        .populate(
          "studentId",
          "name"
        )

        .sort({
          createdAt: -1
        });

      res.json({

        success: true,
        list

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

/* ======================================
      UPDATE STATUS
====================================== */

router.put(
  "/update-status/:id",
  authTutor,
  async (req, res) => {

    try {

      const booking =
  await Booking.findById(
    req.params.id
  )
  .populate("studentId")
  .populate("tutorId");
      if (!booking) {

        return res.json({

          success: false,
          message: "Booking not found"

        });

      }

      booking.status =
        req.body.status;

      await booking.save();
if(req.body.status === "Completed"){

  const invoiceDir =
    path.join(__dirname,"../invoices");

  if(!fs.existsSync(invoiceDir)){
    fs.mkdirSync(invoiceDir);
  }

  const invoiceFileName =
    `invoice_${booking._id}.pdf`;

  const invoicePath =
    path.join(
      invoiceDir,
      invoiceFileName
    );

  const doc = new PDFDocument({
margin: 50,
size: "A4"
});

doc.pipe(
fs.createWriteStream(invoicePath)
);

/* HEADER */

doc.rect(0,0,612,100)
.fill("#1a73e8");

doc.fillColor("white")
.fontSize(28)
.text("TutorCall",50,35);

doc.fontSize(12)
.text(
"Professional Home Tutor Services",
50,
70
);

/* TITLE */

doc.moveDown(4);

doc.fillColor("black")
.fontSize(22)
.text(
"PAYMENT INVOICE",
{
align:"center"
}
);

doc.moveDown();

doc.fontSize(11)
.text(
`Invoice No : TC-${booking._id.toString().slice(-6)}`
);

doc.text(
`Invoice Date : ${new Date().toLocaleDateString()}`
);

doc.text(
`Invoice Time : ${new Date().toLocaleTimeString()}`
);

/* WATERMARK */

doc.save();

doc.rotate(-45,{
origin:[300,350]
});

doc.fillColor("#eeeeee")
.fontSize(60)
.text(
"TUTORCALL",
120,
320
);

doc.restore();

/* STUDENT DETAILS */

doc.moveDown(2);

doc.fillColor("#1a73e8")
.fontSize(16)
.text("Student Details");

doc.moveDown(0.5);

doc.fillColor("black")
.fontSize(12)
.text(
`Student Name : ${booking.studentId.name}`
);

doc.text(
`Mobile Number : ${booking.studentId.phone || "N/A"}`
);

doc.text(
`Email : ${booking.studentId.email || "N/A"}`
);

/* TUTOR DETAILS */

doc.moveDown(1.5);

doc.fillColor("#1a73e8")
.fontSize(16)
.text("Tutor Details");

doc.moveDown(0.5);

doc.fillColor("black")
.fontSize(12)
.text(
`Tutor Name : ${booking.tutorId.name}`
);

doc.text(
`Subject : ${booking.subject || "N/A"}`
);

doc.text(
`Class Mode : ${booking.mode || "Online"}`
);

doc.text(
"Payment Status : PAID"
);

doc.text(
"Generated By : TutorCall System"
);

/* PAYMENT BOX */

doc.moveDown(2);

const y = doc.y;

doc.roundedRect(
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

doc.fillColor("black")
.fontSize(16)
.text(
`Amount Paid : ₹${booking.amount}`,
70,
y + 20
);

doc.fillColor("#2e7d32")
.fontSize(15)
.text(
"✔ PAYMENT SUCCESSFUL",
320,
y + 20
);

/* FOOTER */

doc.moveDown(6);

doc.strokeColor("#cccccc")
.moveTo(50,doc.y)
.lineTo(550,doc.y)
.stroke();

doc.moveDown();

doc.fillColor("#555")
.fontSize(10)
.text(
"Thank you for choosing TutorCall.",
{
align:"center"
}
);

doc.moveDown(0.5);

doc.text(
"This is a computer generated invoice and does not require signature.",
{
align:"center"
}
);

doc.moveDown(0.5);

doc.text(
"[www.tutorcall.co.in](http://www.tutorcall.co.in) | [support@tutorcall.co.in](mailto:support@tutorcall.co.in)",
{
align:"center"
}
);

doc.end();

  console.log(
    "INVOICE CREATED:",
    invoiceFileName
  );

}
      res.json({

        success: true

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

/* ======================================
      EARNINGS
====================================== */

router.get(
  "/earnings/:id",
  authTutor,
  async (req, res) => {

    try {

      const bookings =
        await Booking.find({

          tutorId: req.params.id,

          status: "Completed"

        });

      const totalEarnings =
        bookings.reduce(

          (sum, b) =>
            sum + (b.amount || 0),

          0

        );

      res.json({

        success: true,

        totalEarnings,

        bookings

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);
console.log("BOOKING ROUTES FILE ENDED");
module.exports = router;

