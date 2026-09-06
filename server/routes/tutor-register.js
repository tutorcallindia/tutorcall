console.log("Tutor JS Loaded");

let otpVerified = false;

// SEND OTP
document.getElementById("sendOtpBtn").addEventListener("click", async () => {

    const phone = document.getElementById("otpPhone").value.trim();

    if (phone.length !== 10) {
        alert("Enter valid mobile number");
        return;
    }

    try {

        const res = await fetch("/api/tutors/send-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ phone })

        });

        const data = await res.json();

        alert(data.message);

    } catch (err) {

        console.log(err);

        alert("Failed to send OTP");

    }

});


// VERIFY OTP
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {

    const phone = document.getElementById("otpPhone").value.trim();

    const otp = document.getElementById("otpCode").value.trim();

    try {

        const res = await fetch("/api/tutors/verify-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                phone,
                otp
            })

        });

        const data = await res.json();

        if (data.success) {

            otpVerified = true;

            document.getElementById("otpSection").style.display = "none";

            document.getElementById("tutorForm").style.display = "grid";

            document.getElementById("phone").value = phone;

            document.getElementById("phone").readOnly = true;

            alert("OTP Verified Successfully");

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.log(err);

        alert("Verification Failed");

    }

});

document
    .getElementById("tutorForm")

    .addEventListener(

        "submit",

        async (e) => {

            e.preventDefault();

            if (!otpVerified) {

                alert("Please verify your mobile number first.");

                return;

            }

            const msg =
                document.getElementById("msg");

            msg.style.color = "blue";

            msg.innerHTML = "Registering...";

            /* PHOTO */

            let photoBase64 = "";

            const photoInput =
                document.getElementById("photo");

            if (
                photoInput.files.length > 0
            ) {

                const file =
                    photoInput.files[0];

                const reader =
                    new FileReader();

                reader.readAsDataURL(file);

                photoBase64 = await new Promise((resolve, reject) => {

                    reader.onload = () => resolve(reader.result);

                    reader.onerror = reject;

                });
            }

            /* DATA */

            const tutorData = {

                name:
                    document.getElementById("name").value,

                phone:
                    document.getElementById("phone").value,

                email:
                    document.getElementById("email").value,

                password:
                    document.getElementById("password").value,

                city:
                    document.getElementById("city").value,

                address:
                    document.getElementById("address").value,

                latitude:
                    document.getElementById("latitude").value,

                longitude:
                    document.getElementById("longitude").value,

                qualification:
                    document.getElementById("qualification").value,

                experience:
                    document.getElementById("experience").value,

                classes:
                    document.getElementById("classes").value,

                subjects:
                    document.getElementById("subjects").value,

                fees:
                    document.getElementById("fees").value,

                mode:
                    document.getElementById("mode").value,

                photo:
                    photoBase64

            };

            try {

                const response =
                    await fetch(

                        "http://localhost:3000/api/tutors/register",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(tutorData)

                        }

                    );

                const data =
                    await response.json();

                console.log(data);

                /* SUCCESS */

                if (data.success) {

                    msg.style.color =
                        "green";

                    msg.innerHTML =
                        "Tutor Registered Successfully ✅";

                    alert(
                        "Tutor Registered Successfully"
                    );

                    document
                        .getElementById("tutorForm")
                        .reset();

                    setTimeout(() => {

                        window.location.href =
                            "tutor-login.html";

                    }, 1000);

                }

                /* FAILED */

                else {

                    msg.style.color =
                        "red";

                    msg.innerHTML =
                        data.message;

                    alert(data.message);

                }

            }

            /* ERROR */

            catch (error) {

                console.log(error);

                msg.style.color =
                    "red";

                msg.innerHTML =
                    "Server Error";

                alert(
                    "Server Error"
                );

            }

        }

    );