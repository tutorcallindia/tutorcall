require("dotenv").config();
console.log("TOP OF SERVER FILE");
console.log("VERSION TEST 07 JUNE");
console.log("VERSION TEST 31 MAY");
console.log("SERVER STARTED");
console.log("MONGO URI =", process.env.MONGO_URI ? "FOUND" : "NOT FOUND");

const express =
  require("express");
  

const mongoose =
  require("mongoose");

const cors =
  require("cors");

const path =
  require("path");

const app =
  express();

/* ===============================
          MIDDLEWARE
================================ */

app.use(cors());

app.use(express.json({ limit: "50mb" }));


app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));
app.use(
"/uploads",
express.static("uploads")
);
app.use(
  express.static(
   path.join(__dirname)
  )
);
/* ===============================
            ROUTES
================================ */
console.log("AFTER EXPRESS");

console.log("LOAD tutorRoutes");
const tutorRoutes =
  require("./routes/tutorRoutes");
  console.log("tutorRoutes loaded successfully");

  console.log("LOAD bookingRoutes");
const bookingRoutes =
  require("./routes/bookingRoutes");

  console.log("LOAD invoiceRoutes");
const invoiceRoutes =
  require("./routes/invoiceRoutes");

  console.log("LOAD paymentRoutes");
const paymentRoutes =
  require("./routes/paymentRoutes");

  console.log("LOAD books");
const bookRoutes =
  require("./routes/books");
 
 
console.log("LOAD studentRoutes");
  const studentRoutes =
  require("./routes/studentRoutes");


console.log("LOAD adminRoutes");
const adminRoutes =
  require("./routes/adminRoutes");

  console.log("LOAD reviewRoutes");
  const reviewRoutes =
require("./routes/reviewRoutes");

console.log("ALL ROUTES LOADED");
console.log("AFTER ALL ROUTES 1");
console.log("AFTER ALL ROUTES 2");
console.log("AFTER ALL ROUTES 3");
/* ===============================
          API ROUTES
================================ */
console.log("BEFORE API ROUTES");
app.use(
  "/api/tutors",
  tutorRoutes
);

app.use(
  "/api/booking",
  bookingRoutes
);

app.use(
  "/api/invoice",
  invoiceRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/books",
  bookRoutes
);

app.use(
  "/api/students",
  studentRoutes
);
app.use(
  "/api/admin",
  adminRoutes
);
app.use(
  "/api/review",
  reviewRoutes
);
app.use(
"/uploads",
express.static("uploads")
);
/* ===============================
            TEST
================================ */

app.get("/", (req, res) => {
  res.send("TutorCall Backend Running Successfully");
});

/* ===============================
          MONGODB
================================ */
console.log("BEFORE MONGODB CONNECT");

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MONGODB CONNECTED");
})
.catch(err => {
  console.log("MONGODB ERROR");
  console.error(err);
});
console.log("BEFORE APP LISTEN");


/* ===============================
            SERVER
================================ */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, ()=>{

  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );

});