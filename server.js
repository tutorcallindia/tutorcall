require("dotenv").config();
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

const tutorRoutes =
  require("./routes/tutorRoutes");

const bookingRoutes =
  require("./routes/bookingRoutes");

const invoiceRoutes =
  require("./routes/invoiceRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const bookRoutes =
  require("./routes/books");
 const studentRoutes =
  require("./routes/studentRoutes");
const adminRoutes =
  require("./routes/adminRoutes");
  const reviewRoutes =
require("./routes/reviewRoutes");
/* ===============================
          API ROUTES
================================ */

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

app.get("/", (req,res)=>{

  res.sendFile(

   path.join(
  __dirname,
  "index.html"
)

  );

});

/* ===============================
          MONGODB
================================ */
console.log("BEFORE MONGODB CONNECT");
mongoose.connect(

  process.env.MONGO_URI,

  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

)
.then(()=>{
console.log("MONGODB CONNECTED");

  console.log(
    "✅ MongoDB Connected Successfully!"
  );

})

.catch(err=>{
console.log("MONGODB ERROR");
console.error(err);
  console.error(
    "❌ MongoDB Error:",
    err.message
  );

});

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