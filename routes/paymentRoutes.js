const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const Payment = require("../models/payment");
const Booking = require("../models/booking");
const Tutor = require("../models/tutor");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 🔹 CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.json({ success: false, message: "Amount required" });
    }

    const order = await razorpay.orders.create({
      amount, // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// 🔥 VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      tutorId,
      amount
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }



    // ✅ SAVE PAYMENT
    await Payment.create({
      tutorId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "PAID"
    });



   if (tutorId) {

  const tutor = await Tutor.findById(tutorId);

  if (tutor) {

    let days = 30;
    let planName = "Monthly";

    if (amount == 5900) {
      days = 180;
      planName = "6 Months";
    }

    if (amount == 10100) {
      days = 365;
      planName = "Yearly";
    }

    tutor.isSubscribed = true;

    tutor.subscriptionPlan = planName;

    tutor.subscriptionAmount = amount / 100;

    tutor.subscriptionExpiry = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    );

    await tutor.save();

  }

}
    // ✅ UPDATE BOOKING
    const booking =
await Booking.findById(bookingId);

if(!booking){

  return res.json({
    success:false,
    message:"Booking not found"
  });

}

if(booking.status === "Completed"){

  return res.json({
    success:false,
    message:"Already paid"
  });

}

booking.status = "Completed";

await booking.save();

    res.json({
      success: true,
      message: "Payment verified & booking completed"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
