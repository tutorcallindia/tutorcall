const jwt = require("jsonwebtoken");
const express = require("express");

const router = express.Router();

const Tutor = require("../models/tutor");
const StudentRequest = require("../models/studentRequest");
const Student = require("../models/student");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Review = require("../models/review");


/* =========================================
              ADMIN LOGIN
========================================= */

router.post("/login", async(req,res)=>{

  try{

    const {
      username,
      password
    } = req.body;

    if(
      username !== "admin"
      ||
      password !== "admin123"
    ){

      return res.json({

        success:false,
        message:"Invalid Credentials"

      });

    }

    const token = jwt.sign(

      {
        role:"admin"
      },

      "SUPER_ADMIN_SECRET",

      {
        expiresIn:"7d"
      }

    );

    res.json({

      success:true,
      token,

      admin:{
        username:"admin"
      }

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false,
      message:"Server Error"

    });

  }

});
/* =========================================
        BLOCK / UNBLOCK TUTOR
========================================= */

router.put("/toggle-block/:id", async (req, res) => {

  try {

    const tutor =
      await Tutor.findById(req.params.id);

    if (!tutor) {

      return res.json({

        success: false,
        message: "Tutor not found"

      });

    }

    tutor.isBlocked = !tutor.isBlocked;

    await tutor.save();

    res.json({

      success: true,
      message: tutor.isBlocked
        ? "Tutor Blocked"
        : "Tutor Unblocked",

      isBlocked: tutor.isBlocked

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

});
/* =========================================
            APPROVE TUTOR
========================================= */

router.put("/approve/:id", async(req,res)=>{

  try{

    const tutor =
      await Tutor.findById(req.params.id);

    if(!tutor){

      return res.json({
        success:false,
        message:"Tutor not found"
      });

    }

    tutor.isApproved = true;

    await tutor.save();

    res.json({

      success:true,
      message:"Tutor Approved"

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false,
      message:"Server Error"

    });

  }

});
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Admin API Working"
  });
});


/* =========================================
          ASSIGN TUTOR
========================================= */

router.post("/assign-tutor", async (req, res) => {

  try {

    const { requestId, tutorId } = req.body;

    const request =
      await StudentRequest.findById(requestId);

    if (!request) {

      return res.json({
        success: false,
        message: "Request not found"
      });

    }

    request.assignedTutor = tutorId;

    await request.save();

    res.json({
      success: true,
      message: "Tutor Assigned Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});


/* =========================================
      ASSIGNED STUDENTS FOR TUTOR
========================================= */

router.get("/assigned-students/:tutorId", async (req, res) => {

  try {

    const students =
      await StudentRequest.find({

        assignedTutor: req.params.tutorId

      });

    res.json({

      success: true,
      students

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

});


/* =========================================
      ACTIVATE SUBSCRIPTION
========================================= */

router.put("/activate-subscription/:id", async (req, res) => {

console.log("ACTIVATE ROUTE HIT");
  console.log("ID =", req.params.id);
  console.log("BODY =", req.body);

  try {

    const tutor =
      await Tutor.findById(req.params.id);

    if (!tutor) {

      return res.json({
        success: false,
        message: "Tutor not found"
      });

    }

    const { plan } = req.body;

    let days = 30;
    let amount = 29;
    let planName = "Monthly";

    if (plan === "2") {

      days = 180;
      amount = 59;
      planName = "6 Months";

    }

    if (plan === "3") {

      days = 365;
      amount = 101;
      planName = "Yearly";

    }

    tutor.isSubscribed = true;

    tutor.subscriptionPlan =
      planName;

    tutor.subscriptionAmount =
      amount;

    tutor.subscriptionExpiry =
      new Date(
        Date.now() +
        days * 24 * 60 * 60 * 1000
      );

    await tutor.save();

    res.json({

      success: true,

      message:
        `${planName} Subscription Activated`

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

});
/* =========================================
        MASTER DASHBOARD DATA
========================================= */

router.get("/dashboard", async (req, res) => {

  try {

    // ================================
    // BASIC COUNTS
    // ================================

    const totalStudents = await Student.countDocuments();

    const totalTutors = await Tutor.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const pendingBookings =
      await Booking.countDocuments({
        status: "Pending"
      });

    const acceptedBookings =
      await Booking.countDocuments({
        status: "Accepted"
      });

    const completedBookings =
      await Booking.countDocuments({
        status: "Completed"
      });

    const cancelledBookings =
      await Booking.countDocuments({
        status: "Cancelled"
      });


    // ================================
    // TUTOR COUNTS
    // ================================

    const approvedTutors =
      await Tutor.countDocuments({
        isApproved: true
      });

    const blockedTutors =
      await Tutor.countDocuments({
        isBlocked: true
      });

    const subscribedTutors =
      await Tutor.countDocuments({
        isSubscribed: true
      });


    // ================================
    // PAYMENT DATA
    // ================================

    const totalPayments =
      await Payment.countDocuments({
        status: "PAID"
      });

    const revenueResult =
      await Payment.aggregate([

        {
          $match: {
            status: "PAID"
          }
        },

        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount"
            }
          }
        }

      ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;


    // ================================
    // REVIEWS
    // ================================

    const totalReviews =
      await Review.countDocuments();


    // ================================
    // RECENT BOOKINGS
    // ================================

    const recentBookings =
      await Booking.find()

        .populate(
          "studentId",
          "name phone email"
        )

        .populate(
          "tutorId",
          "name phone email"
        )

        .sort({
          createdAt: -1
        })

        .limit(10);


    // ================================
    // RESPONSE
    // ================================

    res.json({

      success: true,

      stats: {

        totalStudents,

        totalTutors,

        totalBookings,

        pendingBookings,

        acceptedBookings,

        completedBookings,

        cancelledBookings,

        approvedTutors,

        blockedTutors,

        subscribedTutors,

        totalPayments,

        totalRevenue,

        totalReviews

      },

      recentBookings

    });


  } catch (err) {

    console.error(
      "MASTER DASHBOARD ERROR:",
      err
    );

    res.status(500).json({

      success: false,

      message: "Failed to load dashboard data",

      error: err.message

    });

  }

});
/* =========================================
          MASTER - ALL TUTORS
========================================= */

router.get("/tutors", async (req, res) => {

  try {

    const tutors = await Tutor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tutors
    });

  } catch (err) {

    console.error("MASTER TUTORS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load tutors"
    });

  }

});

/* =========================================
          MASTER - ALL STUDENTS
========================================= */

router.get("/students", async (req, res) => {

  try {

    const students = await Student.find()
      .select("-password")
      .sort({ date: -1 });

    res.json({
      success: true,
      students
    });

  } catch (err) {

    console.error("MASTER STUDENTS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load students"
    });

  }

});


/* =========================================
       BLOCK / UNBLOCK STUDENT
========================================= */

router.put("/student/toggle-block/:id", async (req, res) => {

  try {

    const student = await Student.findById(req.params.id);

    if (!student) {

      return res.json({
        success: false,
        message: "Student not found"
      });

    }

    student.isBlocked = !student.isBlocked;

    await student.save();

    res.json({

      success: true,

      message: student.isBlocked
        ? "Student Blocked"
        : "Student Unblocked",

      isBlocked: student.isBlocked

    });

  } catch (err) {

    console.error("STUDENT BLOCK ERROR:", err);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

});
module.exports = router;