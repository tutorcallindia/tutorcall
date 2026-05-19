const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authStudent = require("../middleware/authStudent");
const Review = require("../models/review");
const Booking = require("../models/booking");

const JWT_SECRET = "MY_SECRET_KEY";

// --------------------------------------
// ✔ STUDENT REGISTER API
// --------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, city } = req.body;

    if (!name || !phone || !email || !password)
      return res.json({ success: false, message: "All fields required" });

    const exists = await Student.findOne({ phone });
    if (exists)
      return res.json({ success: false, message: "Phone already registered" });

    const emailExists = await Student.findOne({ email });
    if (emailExists)
      return res.json({ success: false, message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      phone,
      email,
      password: hash,
      city
    });

    await student.save();
    return res.json({ success: true, message: "Student Registered Successfully!" });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// --------------------------------------
// ✔ STUDENT LOGIN API (Full data return)
// --------------------------------------
router.post("/login", async (req, res) => {
  try {

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.json({
        success: false,
        message: "Phone and password required"
      });
    }

    const student = await Student.findOne({ phone });

    if (!student) {
      return res.json({
        success: false,
        message: "Student not found"
      });
    }

    const match =
      await bcrypt.compare(
        password,
        student.password
      );

    if (!match) {
      return res.json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: student._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        city: student.city
      }
    });

  } catch (err) {

    return res.json({
      success: false,
      message: err.message
    });

  }
});
// ------------------------------------------
// ✔ ADD REVIEW (Student → Tutor) (protected)
// ------------------------------------------
router.post("/review", authStudent, async (req, res) => {
  try {
    const { tutorId, rating, reviewText } = req.body;

    if (!tutorId || !rating) {
      return res.json({ success: false, message: "tutorId and rating required" });
    }

    const review = await Review.create({
      tutorId,
      studentId: req.student._id,
      rating,
      reviewText: reviewText || ""
    });

    return res.json({ success: true, message: "Review Submitted!", review });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// ------------------------------------------
// ✔ CREATE BOOKING (Student -> Tutor) (protected)
// Endpoint: POST /student/book
// ------------------------------------------
router.post("/book", authStudent, async (req, res) => {
  try {
    const { tutorId, schedule, message, amount } = req.body;

    if (!tutorId) return res.json({ success: false, message: "tutorId required" });
    if (!amount || isNaN(Number(amount))) return res.json({ success: false, message: "amount required" });

    const booking = await Booking.create({
      tutorId,
      studentId: req.student._id,
      schedule: schedule || null,
      message: message || "",
      amount: Number(amount),
      status: "Pending",
      createdAt: new Date()
    });

    return res.json({ success: true, message: "Booking request created", booking });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// ------------------------------------------
// ✔ GET MY BOOKINGS (Student) (protected)
// Endpoint: GET /student/bookings
// ------------------------------------------
router.get("/bookings", authStudent, async (req, res) => {
  try {
    const list = await Booking.find({ studentId: req.student._id })
      .populate("tutorId", "name phone city qualification fees photo")
      .sort({ createdAt: -1 });

    return res.json({ success: true, list });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// --------------------------------------
// ✔ STUDENT PROFILE UPDATE API (protected)
// --------------------------------------
router.put("/update", authStudent, async (req, res) => {
  try {
    const studentId = req.student._id;
    const allowedFields = ["name", "phone", "email", "city"];

    const update = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Student Profile Updated",
      student: updatedStudent
    });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});
// -------------------------------------------------
// ✔ Student: Cancel Booking (student can cancel their booking)
// Endpoint: PUT /api/students/booking/cancel
// Body: { bookingId }
// -------------------------------------------------
router.put("/booking/cancel", authStudent, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.json({ success: false, message: "bookingId required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    // Ensure the logged-in student owns this booking
    if (String(booking.studentId) !== String(req.student._id)) {
      return res.json({ success: false, message: "Not authorized to cancel this booking" });
    }

    // Only allow cancel if Pending or Accepted (you can adjust business rules)
    if (!["Pending", "Accepted"].includes(booking.status)) {
      return res.json({ success: false, message: `Cannot cancel a booking with status "${booking.status}"` });
    }

    booking.status = "Cancelled";
    await booking.save();

    return res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});


// -------------------------------------------------
// ✔ Student: Reschedule Booking
// Endpoint: PUT /api/students/booking/reschedule
// Body: { bookingId, schedule }  (schedule should be parseable date/string)
// -------------------------------------------------
router.put("/booking/reschedule", authStudent, async (req, res) => {
  try {
    const { bookingId, schedule } = req.body;
    if (!bookingId || !schedule) return res.json({ success: false, message: "bookingId and schedule required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    // Ensure the logged-in student owns this booking
    if (String(booking.studentId) !== String(req.student._id)) {
      return res.json({ success: false, message: "Not authorized to reschedule this booking" });
    }

    // Only allow reschedule if Accepted (or Pending if you prefer)
    if (!["Accepted", "Pending"].includes(booking.status)) {
      return res.json({ success: false, message: `Cannot reschedule a booking with status "${booking.status}"` });
    }

    // Try to parse schedule to Date — save as ISO string if invalid Date
    const parsed = new Date(schedule);
    booking.schedule = isNaN(parsed.getTime()) ? schedule : parsed.toISOString();

    // Optionally change status back to Pending or keep Accepted — here we'll keep current status
    // booking.status = "Accepted";  // or "Pending" if you want tutor to re-approve

    await booking.save();

    return res.json({ success: true, message: "Booking rescheduled", booking });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});
/* ======================================
        GET ALL STUDENTS
====================================== */

router.get("/all", async (req, res) => {

  try {

    const students =
      await Student.find()
      .select("-password");

    res.json({

      success: true,
      students

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false

    });

  }

});
module.exports = router;
