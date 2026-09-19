console.log("Tutor Firebase JS Loaded");

let confirmationResult = null;
let firebaseIdToken = "";
let otpVerified = false;

const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpPhone = document.getElementById("otpPhone");
const otpCode = document.getElementById("otpCode");
const otpSection = document.getElementById("otpSection");
const tutorForm = document.getElementById("tutorForm");
const msg = document.getElementById("msg");


// =====================================================
// FIREBASE CONFIG
// =====================================================
// IMPORTANT:
// Yahan EXACT wahi firebaseConfig use karo
// jo working student-login.html / student-login.js me hai.

const firebaseConfig = {
    apiKey: "PASTE_SAME_API_KEY_FROM_STUDENT_LOGIN",
    authDomain: "tutorcall-8ffad.firebaseapp.com",
    projectId: "tutorcall-8ffad",
    storageBucket: "tutorcall-8ffad.firebasestorage.app",
    messagingSenderId: "PASTE_SAME_MESSAGING_SENDER_ID",
    appId: "PASTE_SAME_APP_ID_FROM_STUDENT_LOGIN"
};


// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();


// =====================================================
// RECAPTCHA
// =====================================================

let recaptchaVerifier = null;

window.addEventListener("load", async () => {

    try {

        recaptchaVerifier =
            new firebase.auth.RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "normal"
                }
            );

        await recaptchaVerifier.render();

        console.log("Firebase reCAPTCHA Ready");

    } catch (error) {

        console.error("reCAPTCHA Error:", error);

    }

});


// =====================================================
// SEND FIREBASE OTP
// =====================================================

sendOtpBtn.addEventListener("click", async () => {

    const phone = otpPhone.value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Enter valid 10 digit mobile number");

        return;
    }

    if (!recaptchaVerifier) {

        alert("reCAPTCHA is not ready. Please wait a moment.");

        return;
    }

    try {

        sendOtpBtn.disabled = true;

        sendOtpBtn.innerText = "Sending OTP...";

        const fullPhone = "+91" + phone;

        confirmationResult =
            await auth.signInWithPhoneNumber(
                fullPhone,
                recaptchaVerifier
            );

        console.log("Firebase OTP Sent");

        alert("OTP sent successfully to your mobile number.");

        otpCode.style.display = "block";

        verifyOtpBtn.style.display = "block";

        otpPhone.readOnly = true;

        sendOtpBtn.innerText = "OTP Sent";

    } catch (error) {

        console.error("Firebase OTP Error:", error);

        sendOtpBtn.disabled = false;

        sendOtpBtn.innerText = "Send OTP";

        alert(
            error.message ||
            "Failed to send OTP"
        );

        // Reset reCAPTCHA
        try {

            recaptchaVerifier.clear();

            recaptchaVerifier =
                new firebase.auth.RecaptchaVerifier(
                    "recaptcha-container",
                    {
                        size: "normal"
                    }
                );

            await recaptchaVerifier.render();

        } catch (recaptchaError) {

            console.error(recaptchaError);

        }

    }

});


// =====================================================
// VERIFY FIREBASE OTP
// =====================================================

verifyOtpBtn.addEventListener("click", async () => {

    const otp = otpCode.value.trim();

    if (!confirmationResult) {

        alert("Please request OTP first.");

        return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {

        alert("Enter valid 6 digit OTP.");

        return;
    }

    try {

        verifyOtpBtn.disabled = true;

        verifyOtpBtn.innerText = "Verifying...";


        // Firebase OTP verification
        const result =
            await confirmationResult.confirm(otp);


        // Get Firebase ID Token
        firebaseIdToken =
            await result.user.getIdToken(true);


        console.log("Firebase OTP Verified");

        otpVerified = true;


        // Put verified phone in registration form
        document.getElementById("phone").value =
            otpPhone.value.trim();

        document.getElementById("phone").readOnly = true;


        // Hide OTP section
        otpSection.style.display = "none";


        // Show registration form
        tutorForm.style.display = "grid";


        alert("Mobile Number Verified Successfully ✅");


    } catch (error) {

        console.error("OTP Verification Error:", error);

        verifyOtpBtn.disabled = false;

        verifyOtpBtn.innerText = "Verify OTP";

        alert(
            error.message ||
            "Invalid OTP"
        );

    }

});


// =====================================================
// TUTOR REGISTRATION
// =====================================================

tutorForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    // OTP check
    if (!otpVerified || !firebaseIdToken) {

        alert(
            "Please verify your mobile number first."
        );

        return;
    }


    msg.style.color = "blue";

    msg.innerHTML =
        "Registering tutor...";


    try {

        // Get latest Firebase token
        if (firebase.auth().currentUser) {

            firebaseIdToken =
                await firebase.auth().currentUser.getIdToken(true);

        }


        // =================================================
        // FORM DATA
        // =================================================

        const formData = new FormData();


        formData.append(
            "firebaseToken",
            firebaseIdToken
        );


        formData.append(
            "name",
            document.getElementById("name").value.trim()
        );

        formData.append(
            "phone",
            document.getElementById("phone").value.trim()
        );

        formData.append(
            "email",
            document.getElementById("email").value.trim()
        );

        formData.append(
            "password",
            document.getElementById("password").value
        );

        formData.append(
            "city",
            document.getElementById("city").value.trim()
        );

        formData.append(
            "address",
            document.getElementById("address").value.trim()
        );

        formData.append(
            "latitude",
            document.getElementById("latitude").value
        );

        formData.append(
            "longitude",
            document.getElementById("longitude").value
        );

        formData.append(
            "qualification",
            document.getElementById("qualification").value.trim()
        );

        formData.append(
            "experience",
            document.getElementById("experience").value
        );

        formData.append(
            "classes",
            document.getElementById("classes").value.trim()
        );

        formData.append(
            "subjects",
            document.getElementById("subjects").value.trim()
        );

        formData.append(
            "fees",
            document.getElementById("fees").value
        );

        formData.append(
            "mode",
            document.getElementById("mode").value
        );


        // =================================================
        // PHOTO
        // =================================================

        const photoInput =
            document.getElementById("photo");


        if (
            photoInput &&
            photoInput.files &&
            photoInput.files.length > 0
        ) {

            formData.append(
                "photo",
                photoInput.files[0]
            );

        }


        // =================================================
        // SEND TO BACKEND
        // =================================================

        const response =
            await fetch(
                "/api/tutors/register",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        console.log(
            "Registration Response:",
            data
        );


        // =================================================
        // SUCCESS
        // =================================================

        if (data.success) {

            msg.style.color = "green";

            msg.innerHTML =
                "Tutor Registered Successfully ✅";


            alert(
                "Tutor Registered Successfully ✅"
            );


            // Sign out Firebase user
            try {

                await auth.signOut();

            } catch (logoutError) {

                console.log(logoutError);

            }


            tutorForm.reset();


            setTimeout(() => {

                window.location.href =
                    "tutor-login.html";

            }, 1000);


        }

        // =================================================
        // FAILED
        // =================================================

        else {

            msg.style.color = "red";

            msg.innerHTML =
                data.message ||
                "Registration failed.";

            alert(
                data.message ||
                "Registration failed."
            );

        }


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        msg.style.color = "red";

        msg.innerHTML =
            "Server Error";


        alert(
            "Server Error. Please try again."
        );

    }

});