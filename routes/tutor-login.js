window.loginTutor = async function () {

  const phone =
    document.getElementById("phone").value;

  const password =
    document.getElementById("password").value;

  const msg =
    document.getElementById("msg");

  msg.innerText = "";

  if (!phone || !password) {

    msg.style.color = "red";

    msg.innerText =
      "Please fill all fields";

    return;
  }

  try {

    const res = await fetch(
      "http://localhost:3000/api/tutors/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          phone,
          password
        })
      }
    );

    const data =
      await res.json();

    console.log(data);

    if (data.success) {

      localStorage.setItem(
        "tutorToken",
        data.token
      );

      localStorage.setItem(
        "tutorInfo",
        JSON.stringify(data.tutor)
      );

      msg.style.color =
        "green";

      msg.innerText =
        "Login Successful";

      setTimeout(() => {

        window.location.href =
          "tutor-dashboard.html";

      }, 1000);

    } else {

      msg.style.color =
        "red";

      msg.innerText =
        data.message;
    }

  } catch (err) {

    console.log(err);

    msg.style.color =
      "red";

    msg.innerText =
      "Server Error";
  }

};