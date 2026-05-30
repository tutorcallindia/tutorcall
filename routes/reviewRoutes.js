const express = require("express");

const router = express.Router();

const Review = require("../models/review");

const Booking = require("../models/Booking");

const authStudent =
require("../middleware/authStudent");


// ====================================
// ADD REVIEW
// ====================================

router.post(
  "/add",

  authStudent,

  async (req, res) => {

    try {

      const {
        tutorId,
        bookingId,
        rating,
        reviewText
      } = req.body;

      // CHECK BOOKING

      const booking =
        await Booking.findById(bookingId);

      if (!booking) {

        return res.json({

          success: false,
          message: "Booking not found"

        });

      }

      // ONLY COMPLETED BOOKING

      if (
        booking.status !== "Completed"
      ) {

        return res.json({

          success: false,
          message:
            "Complete booking first"

        });

      }

      // ALREADY REVIEWED

      const already =
        await Review.findOne({

          tutorId,
          studentId:
            req.student._id

        });

      if (already) {

        return res.json({

          success: false,
          message:
            "Review already added"

        });

      }

      // SAVE REVIEW

      await Review.create({

        tutorId,

        studentId:
          req.student._id,

        rating,

        reviewText

      });

      res.json({

        success: true,
        message:
          "Review Added"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

module.exports = router;