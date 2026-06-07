document
.getElementById("tutorForm")

.addEventListener(

"submit",

async (e) => {

e.preventDefault();

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

photoBase64 =
await new Promise((resolve)=>{

reader.onload = ()=>{

resolve(reader.result);

};

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

setTimeout(()=>{

window.location.href =
"tutor-login.html";

},1000);

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