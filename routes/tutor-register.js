console.log("Tutor Firebase Registration JS Loaded");


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyDhz8zisR0m01UuFcatuOoSuSWM7eHcyTg",
    authDomain: "tutorcall-8ffad.firebaseapp.com",
    projectId: "tutorcall-8ffad",
    storageBucket: "tutorcall-8ffad.firebasestorage.app",
    messagingSenderId: "1092526942662",
    appId: "1:1092526942662:web:05a498f6a02d911ae9eac7"
};


// =====================================================
// FIREBASE INITIALIZATION
// =====================================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();


// =====================================================
// VARIABLES
// =====================================================

let confirmationResult = null;
let firebaseIdToken = "";
let otpVerified = false;
let recaptchaVerifier = null;

let resendBtn = null;
let resendTimer = null;
let resendSeconds = 30;


// =====================================================
// DOM ELEMENTS
// =====================================================

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

const verifyOtpBtn =
    document.getElementById("verifyOtpBtn");

const otpPhone =
    document.getElementById("otpPhone");

const otpCode =
    document.getElementById("otpCode");

const otpSection =
    document.getElementById("otpSection");

const tutorForm =
    document.getElementById("tutorForm");

const msg =
    document.getElementById("msg");

const phoneInput =
    document.getElementById("phone");


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener("load", async () => {

    console.log("Initializing Firebase reCAPTCHA...");

    try {

        await createRecaptcha();

        console.log(
            "Firebase reCAPTCHA Ready"
        );

    } catch (error) {

        console.error(
            "reCAPTCHA initialization error:",
            error
        );

    }

});


// =====================================================
// CREATE / RESET RECAPTCHA
// =====================================================

async function createRecaptcha() {

    try {

        if (recaptchaVerifier) {

            try {
                recaptchaVerifier.clear();
            } catch (e) {
                console.log(
                    "Old reCAPTCHA clear error",
                    e
                );
            }

        }

        recaptchaVerifier =
            new firebase.auth.RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "normal",

                    callback: function () {

                        console.log(
                            "reCAPTCHA completed"
                        );

                    },

                    "expired-callback": function () {

                        console.log(
                            "reCAPTCHA expired"
                        );

                    }
                }
            );


        await recaptchaVerifier.render();

    } catch (error) {

        console.error(
            "Create reCAPTCHA error:",
            error
        );

        throw error;

    }

}


// =====================================================
// CREATE RESEND BUTTON
// =====================================================

function createResendButton() {

    if (resendBtn) {
        return;
    }


    resendBtn =
        document.createElement("button");


    resendBtn.type =
        "button";


    resendBtn.id =
        "resendOtpBtn";


    resendBtn.innerText =
        "Resend OTP";


    resendBtn.style.display =
        "block";


    resendBtn.style.width =
        "100%";


    resendBtn.style.marginTop =
        "10px";


    resendBtn.style.padding =
        "14px";


    resendBtn.style.border =
        "none";


    resendBtn.style.borderRadius =
        "25px";


    resendBtn.style.background =
        "#6c5ce7";


    resendBtn.style.color =
        "#ffffff";


    resendBtn.style.fontSize =
        "16px";


    resendBtn.style.fontWeight =
        "600";


    resendBtn.style.cursor =
        "pointer";


    // Put below Verify button
    verifyOtpBtn.parentNode.insertBefore(
        resendBtn,
        verifyOtpBtn.nextSibling
    );


    resendBtn.addEventListener(
        "click",
        handleResendOtp
    );

}


// =====================================================
// RESEND TIMER
// =====================================================

function startResendTimer() {

    clearInterval(resendTimer);

    resendSeconds = 30;

    resendBtn.disabled = true;

    resendBtn.style.opacity =
        "0.6";


    resendBtn.innerText =
        `Resend OTP (${resendSeconds}s)`;


    resendTimer =
        setInterval(() => {

            resendSeconds--;


            if (resendSeconds <= 0) {

                clearInterval(resendTimer);

                resendBtn.disabled =
                    false;

                resendBtn.style.opacity =
                    "1";

                resendBtn.innerText =
                    "Resend OTP";

                return;

            }


            resendBtn.innerText =
                `Resend OTP (${resendSeconds}s)`;


        }, 1000);

}


// =====================================================
// SEND OTP
// =====================================================

async function sendOtp() {

    const phone =
        otpPhone.value.trim();


    // Validate phone
    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10 digit mobile number."
        );

        return false;

    }


    // Check recaptcha
    if (!recaptchaVerifier) {

        alert(
            "Security verification is not ready. Please wait a moment."
        );

        return false;

    }


    try {

        sendOtpBtn.disabled =
            true;

        sendOtpBtn.innerText =
            "Sending OTP...";


        const fullPhone =
            "+91" + phone;


        console.log(
            "Sending Firebase OTP to:",
            fullPhone
        );


        confirmationResult =
            await auth.signInWithPhoneNumber(
                fullPhone,
                recaptchaVerifier
            );


        console.log(
            "Firebase OTP sent successfully"
        );


        // Show OTP field
        otpCode.style.display =
            "block";


        verifyOtpBtn.style.display =
            "block";


        // Lock phone
        otpPhone.readOnly =
            true;


        // Create resend button
        createResendButton();


        // Start cooldown
        startResendTimer();


        sendOtpBtn.innerText =
            "OTP Sent";


        sendOtpBtn.style.opacity =
            "0.7";


        alert(
            "OTP sent successfully to your mobile number."
        );


        return true;


    } catch (error) {

        console.error(
            "Firebase Send OTP Error:",
            error
        );


        sendOtpBtn.disabled =
            false;


        sendOtpBtn.innerText =
            "Send OTP";


        sendOtpBtn.style.opacity =
            "1";


        // Reset recaptcha
        try {

            await createRecaptcha();

        } catch (recaptchaError) {

            console.error(
                recaptchaError
            );

        }


        let message =
            "Failed to send OTP.";


        if (
            error &&
            error.code
        ) {

            console.log(
                "Firebase error code:",
                error.code
            );

        }


        if (
            error &&
            error.message
        ) {

            message =
                error.message;

        }


        alert(message);


        return false;

    }

}


// =====================================================
// SEND OTP BUTTON
// =====================================================

sendOtpBtn.addEventListener(
    "click",
    async function () {

        await sendOtp();

    }
);


// =====================================================
// RESEND OTP
// =====================================================

async function handleResendOtp() {

    if (
        resendBtn.disabled
    ) {

        return;

    }


    const phone =
        otpPhone.value.trim();


    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid mobile number."
        );

        return;

    }


    try {

        resendBtn.disabled =
            true;

        resendBtn.innerText =
            "Sending new OTP...";


        // Clear old Firebase session
        confirmationResult =
            null;


        // Clear old OTP
        otpCode.value =
            "";


        // Reset reCAPTCHA
        await createRecaptcha();


        // Send fresh OTP
        const result =
            await auth.signInWithPhoneNumber(
                "+91" + phone,
                recaptchaVerifier
            );


        confirmationResult =
            result;


        console.log(
            "New Firebase OTP sent"
        );


        startResendTimer();


        alert(
            "New OTP sent successfully."
        );


    } catch (error) {

        console.error(
            "Resend OTP Error:",
            error
        );


        resendBtn.disabled =
            false;

        resendBtn.innerText =
            "Resend OTP";


        alert(
            error.message ||
            "Failed to resend OTP."
        );


        try {

            await createRecaptcha();

        } catch (e) {

            console.error(e);

        }

    }

}


// =====================================================
// VERIFY OTP
// =====================================================

verifyOtpBtn.addEventListener(
    "click",
    async function () {

        const otp =
            otpCode.value.trim();


        if (!confirmationResult) {

            alert(
                "Please request a new OTP first."
            );

            return;

        }


        if (!/^[0-9]{6}$/.test(otp)) {

            alert(
                "Please enter the 6 digit OTP."
            );

            return;

        }


        try {

            verifyOtpBtn.disabled =
                true;

            verifyOtpBtn.innerText =
                "Verifying...";


            console.log(
                "Verifying Firebase OTP..."
            );


            // Firebase verification
            const result =
                await confirmationResult.confirm(
                    otp
                );


            // Firebase ID token
            firebaseIdToken =
                await result.user.getIdToken(
                    true
                );


            console.log(
                "Firebase OTP verified successfully"
            );


            otpVerified =
                true;


            // Set verified phone
            phoneInput.value =
                otpPhone.value.trim();


            phoneInput.readOnly =
                true;


            // Stop resend timer
            clearInterval(
                resendTimer
            );


            // Hide OTP section
            otpSection.style.display =
                "none";


            // Show registration form
            tutorForm.style.display =
                "grid";


            alert(
                "Mobile Number Verified Successfully ✅"
            );


        } catch (error) {

            console.error(
                "Firebase OTP Verification Error:",
                error
            );


            verifyOtpBtn.disabled =
                false;


            verifyOtpBtn.innerText =
                "Verify OTP";


            otpCode.value =
                "";


            let message =
                "Invalid or expired OTP.";


            if (
                error.code ===
                "auth/code-expired"
            ) {

                message =
                    "OTP expired. Please click Resend OTP and use the new OTP.";

            }

            else if (
                error.code ===
                "auth/invalid-verification-code"
            ) {

                message =
                    "Invalid OTP. Please check the latest OTP.";

            }

            else if (
                error.message
            ) {

                message =
                    error.message;

            }


            alert(message);

        }

    }
);


// =====================================================
// TUTOR REGISTRATION
// =====================================================

tutorForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        // OTP check
        if (
            !otpVerified ||
            !firebaseIdToken
        ) {

            alert(
                "Please verify your mobile number first."
            );

            return;

        }


        msg.style.color =
            "blue";

        msg.innerHTML =
            "Registering tutor...";


        try {

            // Get latest Firebase token
            if (
                firebase.auth().currentUser
            ) {

                firebaseIdToken =
                    await firebase.auth()
                        .currentUser
                        .getIdToken(true);

            }


            // =========================================
            // FORM DATA
            // =========================================

            const formData =
                new FormData();


            formData.append(
                "firebaseToken",
                firebaseIdToken
            );


            formData.append(
                "name",
                document.getElementById(
                    "name"
                ).value.trim()
            );


            formData.append(
                "phone",
                document.getElementById(
                    "phone"
                ).value.trim()
            );


            formData.append(
                "email",
                document.getElementById(
                    "email"
                ).value.trim()
            );


            formData.append(
                "password",
                document.getElementById(
                    "password"
                ).value
            );


            formData.append(
                "city",
                document.getElementById(
                    "city"
                ).value.trim()
            );


            formData.append(
                "address",
                document.getElementById(
                    "address"
                ).value.trim()
            );


            formData.append(
                "latitude",
                document.getElementById(
                    "latitude"
                ).value
            );


            formData.append(
                "longitude",
                document.getElementById(
                    "longitude"
                ).value
            );


            formData.append(
                "qualification",
                document.getElementById(
                    "qualification"
                ).value.trim()
            );


            formData.append(
                "experience",
                document.getElementById(
                    "experience"
                ).value
            );


            formData.append(
                "classes",
                document.getElementById(
                    "classes"
                ).value.trim()
            );


            formData.append(
                "subjects",
                document.getElementById(
                    "subjects"
                ).value.trim()
            );


            formData.append(
                "fees",
                document.getElementById(
                    "fees"
                ).value
            );


            formData.append(
                "mode",
                document.getElementById(
                    "mode"
                ).value
            );


            // =========================================
            // PHOTO
            // =========================================

            const photoInput =
                document.getElementById(
                    "photo"
                );


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


            // =========================================
            // SEND TO BACKEND
            // =========================================

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


            // =========================================
            // SUCCESS
            // =========================================

            if (data.success) {

                msg.style.color =
                    "green";


                msg.innerHTML =
                    "Tutor Registered Successfully ✅";


                alert(
                    "Tutor Registered Successfully ✅"
                );


                // Firebase logout
                try {

                    await auth.signOut();

                } catch (logoutError) {

                    console.log(
                        "Firebase logout error:",
                        logoutError
                    );

                }


                tutorForm.reset();


                setTimeout(
                    function () {

                        window.location.href =
                            "tutor-login.html";

                    },
                    1000
                );


                return;

            }


            // =========================================
            // REGISTRATION FAILED
            // =========================================

            msg.style.color =
                "red";


            msg.innerHTML =
                data.message ||
                "Registration failed.";


            alert(
                data.message ||
                "Registration failed."
            );

        } catch (error) {

            console.error(
                "Tutor Registration Error:",
                error
            );


            msg.style.color =
                "red";


            msg.innerHTML =
                "Server Error";


            alert(
                "Server Error. Please try again."
            );

        }

    }
);