// ===============================
// LOGIN CHECK
// ===============================

const token = localStorage.getItem("tutorToken");
const tutorInfo = localStorage.getItem("tutorData");

if (!token || !tutorInfo) {

    localStorage.removeItem("tutorToken");
    localStorage.removeItem("tutorData");
    localStorage.removeItem("tutorId");

    alert("Please login first");

    window.location.replace("/routes/tutor-login.html");

    throw new Error("Not Logged In");
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
                headers:{
                    Authorization:"Bearer "+token
                }
            }
        );

        const data = await res.json();

        console.log(data);

        const tbody = document.getElementById("bookingTable");

        tbody.innerHTML = "";

        if(!data.success || !data.list || data.list.length===0){

            tbody.innerHTML = `
            <tr>
                <td colspan="5">No Booking Found</td>
            </tr>
            `;

            return;
        }

        let pending=0;
        let accepted=0;
        let completed=0;

        data.list.forEach(b=>{

            if(b.tutorId && b.tutorId._id!=tutor._id){
                return;
            }

            if(b.status=="Pending") pending++;
            if(b.status=="Accepted") accepted++;
            if(b.status=="Completed") completed++;

            tbody.innerHTML += `
            <tr>

                <td>${b.studentId?.name || "-"}</td>

                <td>${b.schedule || "-"}</td>

                <td>${b.message || "-"}</td>

                <td>${b.status}</td>

                <td>

                    ${
                        b.status=="Pending"
                        ?
                        `
                        <button class="btn accept"
                        onclick="acceptBooking('${b._id}')">
                        Accept
                        </button>

                        <button class="btn reject"
                        onclick="rejectBooking('${b._id}')">
                        Reject
                        </button>
                        `
                        :
                        "-"
                    }

                </td>

            </tr>
            `;

        });

        document.getElementById("pendingCount").innerText=pending;
        document.getElementById("acceptedCount").innerText=accepted;
        document.getElementById("completedCount").innerText=completed;

    }

    catch(err){

        console.log(err);

    }

}

async function acceptBooking(id){

    const res=await fetch(
        "https://tutorcall.co.in/api/booking/accept/"+id,
        {
            method:"POST"
        }
    );

    const data=await res.json();

    alert(data.message);

    loadBookings();

}

async function rejectBooking(id){

    const res=await fetch(
        "https://tutorcall.co.in/api/booking/reject/"+id,
        {
            method:"POST"
        }
    );

    const data=await res.json();

    alert(data.message);

    loadBookings();

}

document.getElementById("logoutBtn").onclick=function(){

localStorage.removeItem("tutorToken");
localStorage.removeItem("tutorData");
localStorage.removeItem("tutorId");

window.location.href="/routes/tutor-login.html";

}