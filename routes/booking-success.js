function downloadInvoice() {
  // normally ye booking ke baad backend se aata hai
  const bookingId = "123"; // demo id

  fetch("http://localhost:3000/api/booking/complete-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bookingId: bookingId,
      studentName: "Amit Kumar",
      studentPhone: "9876543210",
      tutorName: "Shyam",
      subject: "Maths",
      mode: "Home Tuition",
      amount: 700
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.open("http://localhost:3000" + data.invoiceUrl);
    } else {
      alert("Invoice generation failed");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}
