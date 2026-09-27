console.log("Tutor Firebase Login JS Loaded");


/* =========================================
   FIREBASE CONFIG
   ========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDhz8zisR0m01UuFcatuOoSuSWM7eHcyTg",
    authDomain: "tutorcall-8ffad.firebaseapp.com",
    projectId: "tutorcall-8ffad",
    storageBucket: "tutorcall-8ffad.firebasestorage.app",
    messagingSenderId: "1092526942662",
    appId: "1:1092526942662:web:05a498f6a02d911ae9eac7"
};


/* =========================================
   FIREBASE INITIALIZE
   ========================================= */

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();


/* =========================================
   VARIABLES
   ========================================= */

let confirmationResult = null;
let recaptchaVerifier = null;
let resendTimer = null;
let resendSeconds = 0;


/* =========================================
   ELEMENTS
   ========================================= */

const phoneInput =
  document.getElementById("phone");

const sendOtpBtn =
  document.getElementById("sendOtpBtn");

const otpSection =
  document.getElementById("otpSection");

const otpCode =
  document.getElementById("otpCode");

const verifyOtpBtn =
  document.getElementById("verifyOtpBtn");

const resendOtpBtn =
  document.getElementById("resendOtpBtn");

const msg =
  document.getElementById("msg");


/* =========================================
   MESSAGE
   ========================================= */

function showMessage(message, color = "#333") {

  msg.style.color = color;
  msg.innerText = message;

}


/* =========================================
   RECAPTCHA
   ========================================= */

function setupRecaptcha() {

  try {

    recaptchaVerifier =
      new firebase.auth.RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "normal"
        },
        auth
      );

    recaptchaVerifier.render();

    console.log("reCAPTCHA ready");

  } catch (error) {

    console.error(
      "reCAPTCHA ERROR:",
      error
    );

    showMessage(
      "reCAPTCHA failed. Please refresh the page.",
      "red"
    );

  }

}


/* =========================================
   SEND OTP
   ========================================= */

async function sendOTP() {

  const phone =
    phoneInput.value.trim();


  if (!/^\d{10}$/.test(phone)) {

    showMessage(
      "Enter valid 10 digit mobile number.",
      "red"
    );

    return;

  }


  sendOtpBtn.disabled = true;

  sendOtpBtn.innerText =
    "Sending OTP...";

  showMessage(
    "Please wait...",
    "#555"
  );


  try {

    const fullPhone =
      "+91" + phone;


    confirmationResult =
      await auth.signInWithPhoneNumber(
        fullPhone,
        recaptchaVerifier
      );


    otpSection.classList.remove(
      "hidden"
    );


    showMessage(
      "OTP sent successfully.",
      "green"
    );


    startResendTimer();


  } catch (error) {

    console.error(
      "SEND OTP ERROR:",
      error
    );


    showMessage(
      "Firebase: " +
      error.message,
      "red"
    );


    sendOtpBtn.disabled = false;

    sendOtpBtn.innerText =
      "Send OTP";


    /*
      reCAPTCHA ko reset karna zaroori hai
      agar OTP send fail ho
    */

    try {

      if (recaptchaVerifier) {

        recaptchaVerifier.clear();

      }

      setupRecaptcha();

    } catch (e) {

      console.error(e);

    }

  }

}


/* =========================================
   VERIFY OTP
   ========================================= */

async function verifyOTP() {

  const otp =
    otpCode.value.trim();


  if (!/^\d{6}$/.test(otp)) {

    showMessage(
      "Please enter 6 digit OTP.",
      "red"
    );

    return;

  }


  if (!confirmationResult) {

    showMessage(
      "Please request OTP first.",
      "red"
    );

    return;

  }


  verifyOtpBtn.disabled = true;

  verifyOtpBtn.innerText =
    "Verifying...";


  try {

    const result =
      await confirmationResult.confirm(
        otp
      );


    /*
      Firebase ID TOKEN
    */

    const firebaseToken =
      await result.user.getIdToken(
        true
      );


    showMessage(
      "Mobile verified. Logging in...",
      "green"
    );


    /*
      SEND TOKEN TO BACKEND
    */

    const response =
      await fetch(
        "/api/tutors/firebase-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            firebaseToken
          })
        }
      );


    const data =
      await response.json();


    console.log(
      "Backend Login:",
      data
    );


    if (!data.success) {

      showMessage(
        data.message ||
        "Tutor login failed.",
        "red"
      );

      verifyOtpBtn.disabled = false;

      verifyOtpBtn.innerText =
        "Verify OTP";

      return;

    }


    /*
      SAVE LOGIN DATA
    */

    localStorage.setItem(
      "tutorToken",
      data.token
    );


    localStorage.setItem(
      "tutorId",
      data.tutor._id
    );


    localStorage.setItem(
      "tutorData",
      JSON.stringify(
        data.tutor
      )
    );


    showMessage(
      "Login Successful ✅",
      "green"
    );


    /*
      DASHBOARD
    */

    setTimeout(() => {

      window.location.href =
        "/routes/tutor-dashboard-v2.html";

    }, 800);


  } catch (error) {

    console.error(
      "VERIFY OTP ERROR:",
      error
    );


    showMessage(
      "Firebase: " +
      error.message,
      "red"
    );


    verifyOtpBtn.disabled = false;

    verifyOtpBtn.innerText =
      "Verify OTP";

  }

}


/* =========================================
   RESEND TIMER
   ========================================= */

function startResendTimer() {

  clearInterval(
    resendTimer
  );


  resendSeconds = 30;

  resendOtpBtn.disabled = true;


  resendOtpBtn.innerText =
    "Resend OTP (" +
    resendSeconds +
    "s)";


  resendTimer =
    setInterval(() => {

      resendSeconds--;


      if (resendSeconds <= 0) {

        clearInterval(
          resendTimer
        );


        resendOtpBtn.disabled =
          false;


        resendOtpBtn.innerText =
          "Resend OTP";


        return;

      }


      resendOtpBtn.innerText =
        "Resend OTP (" +
        resendSeconds +
        "s)";

    }, 1000);

}


/* =========================================
   RESEND OTP
   ========================================= */

async function resendOTP() {

  if (resendOtpBtn.disabled) {

    return;

  }


  /*
    Firebase reCAPTCHA ko recreate
    karte hain
  */

  try {

    if (recaptchaVerifier) {

      recaptchaVerifier.clear();

    }

  } catch (error) {

    console.log(error);

  }


  const container =
    document.getElementById(
      "recaptcha-container"
    );


  container.innerHTML = "";


  setupRecaptcha();


  await new Promise(
    resolve =>
      setTimeout(resolve, 500)
  );


  await sendOTP();

}


/* =========================================
   BUTTON EVENTS
   ========================================= */

sendOtpBtn.addEventListener(
  "click",
  sendOTP
);


verifyOtpBtn.addEventListener(
  "click",
  verifyOTP
);


resendOtpBtn.addEventListener(
  "click",
  resendOTP
);


/* =========================================
   ENTER KEY
   ========================================= */

phoneInput.addEventListener(
  "keypress",
  function (e) {

    if (e.key === "Enter") {

      sendOTP();

    }

  }
);


otpCode.addEventListener(
  "keypress",
  function (e) {

    if (e.key === "Enter") {

      verifyOTP();

    }

  }
);


/* =========================================
   PAGE LOAD
   ========================================= */

window.addEventListener(
  "load",
  () => {

    setupRecaptcha();

  }
);