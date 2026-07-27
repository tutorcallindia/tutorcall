const express =
  require("express");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

router.post(
  "/register",

  async (req, res) => {

    try {

      const {
        name,
        email
      } = req.body;

      let user =
        await User.findOne({
          email
        });

      if (user) {

        return res.json({

          success: false,

          message:
            "User already exists"
        });
      }

      user =
        await User.create({

          name,
          email
        });

      const token =

        jwt.sign(

          {
            userId:
              user._id
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "30d"
          }
        );

      res.json({

        success: true,

        token,

        user
      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

router.get(
  "/profile",

  authMiddleware,

  async (req, res) => {

    res.json({

      success: true,

      user: req.user
    });
  }
);

module.exports =
  router;