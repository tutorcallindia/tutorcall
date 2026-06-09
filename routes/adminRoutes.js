const jwt = require("jsonwebtoken");
const express = require("express");

const router = express.Router();

const Tutor = require("../models/tutor");
const StudentRequest = require("../models/studentRequest");
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
module.exports = router;