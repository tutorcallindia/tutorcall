console.log("TUTOR ROUTES FILE START 111");

const express = require("express");

const router = express.Router();


console.log("BEFORE Booking");
const Booking = require("../models/booking");
console.log("AFTER Booking");

console.log("JWT loading");
const jwt = require("jsonwebtoken");

console.log("Bcrypt loading");
const bcrypt = require("bcryptjs");

console.log("BEFORE Tutor");
const Tutor = require("../models/tutor");
console.log("AFTER Tutor");

console.log("Multer loading");
const multer = require("multer");

console.log("ALL TUTOR ROUTES DEPENDENCIES LOADED");

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, "uploads/");
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
const authTutor = require("../middleware/authTutor");

const twilio = require("twilio");

const client = twilio(

process.env.TWILIO_ACCOUNT_SID,

process.env.TWILIO_AUTH_TOKEN

);

// Memory OTP Storage

const otpStore = {};

/* =========================================
            SEND OTP
========================================= */

router.post("/send-otp", async (req,res)=>{

try{

const { phone } = req.body;

if(!phone){

return res.json({

success:false,

message:"Phone Required"

});

}

const otp =

Math.floor(

100000+

Math.random()*900000

).toString();

otpStore[phone]={

otp,

expires:Date.now()+5*60*1000

};

await client.messages.create({

body:`TutorCall OTP : ${otp}`,

from:process.env.TWILIO_PHONE_NUMBER,

to:"+91"+phone

});

res.json({

success:true,

message:"OTP Sent"

});

}

catch(err){

console.log(err);

res.json({

success:false,

message:"Failed to Send OTP"

});

}

});

/* =========================================
            VERIFY OTP
========================================= */

router.post("/verify-otp",(req,res)=>{

const { phone, otp }=req.body;

const data=

otpStore[phone];

if(!data){

return res.json({

success:false,

message:"OTP Not Found"

});

}

if(Date.now()>data.expires){

delete otpStore[phone];

return res.json({

success:false,

message:"OTP Expired"

});

}

if(data.otp!=otp){

return res.json({

success:false,

message:"Invalid OTP"

});

}

delete otpStore[phone];

res.json({

success:true,

message:"OTP Verified"

});

});
/* =========================================
            REGISTER
========================================= */

router.post(
  "/register",

  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),

  async (req, res) => {
  console.log("BODY =", req.body);
console.log("FILES =", req.files);

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
     
      
    } = req.body;
    const photo =
  req.files?.photo?.[0]
    ? `/uploads/${req.files.photo[0].filename}`
    : "";

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

  console.log("ALL ROUTE HIT");

  try {

    console.log("BEFORE FIND");

    const tutors = await Tutor.find({});

    console.log("AFTER FIND");
    console.log("COUNT =", tutors.length);

    res.json({
      success: true,
      tutors
    });

  } catch (err) {

    console.log("TUTOR ALL ERROR =");
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }
});


// ================================
// GET TUTOR BOOKINGS
// ================================
router.get("/bookings", authTutor, async (req, res) => {

    console.log("BOOKINGS ROUTE HIT");
    console.log("Tutor =", req.tutor);

    try {

        const bookings = await Booking.find({
            tutorId: req.tutor._id
        })
        .populate("studentId")
        .sort({
            createdAt: -1
        });

        console.log("BOOKINGS FOUND =", bookings.length);
        console.log(bookings);

        res.json({
            success: true,
            list: bookings
        });

    } catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Failed to load bookings"
        });

    }

});
router.get("/:id", async (req, res) => {

  try {

    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    res.json({
      success: true,
      tutor
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});

// ===============================
// SEND OTP
// ===============================

router.post("/send-otp", async (req, res) => {

    try {

        const { phone } = req.body;

        if (!phone) {
            return res.json({
                success: false,
                message: "Phone number required"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        otpStore[phone] = {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        };

        await twilioClient.messages.create({
            body: `TutorCall OTP is ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
        });

        res.json({
            success: true,
            message: "OTP Sent"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });

    }

});


// ===============================
// VERIFY OTP
// ===============================

router.post("/verify-otp", async (req, res) => {

    try {

        const { phone, otp } = req.body;

        const saved = otpStore[phone];

        if (!saved) {

            return res.json({
                success: false,
                message: "OTP not found"
            });

        }

        if (Date.now() > saved.expires) {

            delete otpStore[phone];

            return res.json({
                success: false,
                message: "OTP Expired"
            });

        }

        if (saved.otp !== otp) {

            return res.json({
                success: false,
                message: "Invalid OTP"
            });

        }

        delete otpStore[phone];

        res.json({
            success: true,
            message: "OTP Verified"
        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});

module.exports = router;
