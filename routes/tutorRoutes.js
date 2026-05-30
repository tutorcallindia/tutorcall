const express = require("express");

const router = express.Router();
const Booking = require("../models/booking");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const Tutor = require("../models/Tutor");

/* =========================================
            REGISTER
========================================= */

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      phone,
      email,
      password,
      city,
      qualification,
      experience,
      classes,
      subjects,
      mode,
      fees,address,
latitude,
longitude,
      photo
      
    } = req.body;

    // REQUIRED CHECK

    if (!name || !phone || !email || !password) {

      return res.json({

        success: false,
        message: "Please fill all required fields"

      });

    }

    // EXISTING CHECK

    const existingTutor =
      await Tutor.findOne({

        $or: [
          { email },
          { phone }
        ]

      });

    if (existingTutor) {

      return res.json({

        success: false,
        message: "Tutor already exists"

      });

    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE

    const tutor =
      await Tutor.create({

        name,
        phone,
        email,
        password: hashedPassword,
        city,
        qualification,
        experience,
        classes,
        subjects,
        mode,
        fees,
        address,
latitude,
longitude,
        photo

      });

    res.json({

      success: true,
      message: "Tutor Registered Successfully",
      tutor

    });

  } catch (err) {

    console.log("REGISTER ERROR =>", err);

    res.status(500).json({

      success: false,
      message: err.message

    });

  }

});

/* =========================================
                LOGIN
========================================= */

router.post("/login", async (req, res) => {

  try {

    const { phone, password } = req.body;

    if (!phone || !password) {

      return res.json({

        success: false,
        message: "Phone & password required"

      });

    }

    const tutor =
      await Tutor.findOne({ phone });

    if (!tutor) {

      return res.json({

        success: false,
        message: "Tutor not found"

      });

    }

    if (tutor.isBlocked) {

      return res.json({

        success: false,
        message: "Account blocked by admin"

      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        tutor.password
      );

    if (!isMatch) {

      return res.json({

        success: false,
        message: "Invalid credentials"

      });

    }

    const token = jwt.sign(

      {
        tutorId: tutor._id
      },

      "TUTOR_SECRET_KEY",

      {
        expiresIn: "7d"
      }

    );

    res.json({

      success: true,
      message: "Login Successful",
      token,
      tutor

    });

  } catch (err) {

    console.log("LOGIN ERROR =>", err);

    res.status(500).json({

      success: false,
      message: err.message

    });

  }

});

/* =========================================
            TUTOR LIST + FILTER
========================================= */

router.get("/list", async (req, res) => {

  try {

    const {
      city,
      subjects,
      classes,
      mode
    } = req.query;

     let filter = {

  isBlocked: false,
  isApproved: true

};

    // CITY FILTER

    if (city) {

      filter.city = {
        $regex: city,
        $options: "i"
      };

    }

    // SUBJECT FILTER

    if (subjects) {

      filter.subjects = {
        $regex: subjects,
        $options: "i"
      };

    }

    // CLASS FILTER

    if (classes) {

      filter.classes = {
        $regex: classes,
        $options: "i"
      };

    }

    // MODE FILTER

    if (mode) {

      filter.mode = mode;

    }

    const tutors =
      await Tutor.find(filter)
      .sort({ createdAt: -1 });

    res.json({

      success: true,
      tutors

    });

  } catch (err) {

    console.log("LIST ERROR =>", err);

    res.status(500).json({

      success: false,
      message: err.message

    });

  }

});
/* =========================================
            ALL TUTORS FOR ADMIN
========================================= */

router.get("/all", async (req, res) => {

  try {

    const tutors =
      await Tutor.find();

    res.json({

      success: true,
      tutors

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false

    });

  }

});



// ================================
// GET TUTOR BOOKINGS
// ================================
router.get("/bookings", async (req, res) => {

  try {

    const bookings = await Booking.find()
      .populate("studentId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      list: bookings
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to load bookings"
    });

  }

});
module.exports = router;