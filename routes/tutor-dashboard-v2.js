// ===============================
// LOGIN CHECK
// ===============================

const token = localStorage.getItem("tutorToken");
const tutorInfo = localStorage.getItem("tutorData");

if (!token || !tutorInfo) {

    alert("Please login first");

    window.location.href = "/routes/tutor-login.html";

}

// ===============================
// TUTOR INFO
// ===============================

const tutor = JSON.parse(tutorInfo);

document.getElementById("tutorName").innerText = tutor.name || "Tutor";

document.getElementById("tutorCity").innerText = tutor.city || "";

if (tutor.photo) {

    document.getElementById("photo").src =
        "https://tutorcall.co.in" + tutor.photo;

}

// ===============================
// LOAD BOOKINGS
// ===============================

loadBookings();

async function loadBookings() {

    try {

        const res = await fetch(

            "https://tutorcall.co.in/api/tutors/bookings",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await res.json();

        console.log(data);

    }

    catch (err) {

        console.log(err);

    }

}