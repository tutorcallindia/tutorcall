const signinBtn =
document.getElementById("signinBtn");

const dropdown =
document.getElementById("signinDropdown");

/* DROPDOWN */

signinBtn.addEventListener("click",(e)=>{

  e.stopPropagation();

  dropdown.style.display =
  dropdown.style.display === "block"
  ? "none"
  : "block";

});

window.addEventListener("click",(e)=>{

  if(!e.target.closest(".signin")){

    dropdown.style.display = "none";

  }

});

/* =========================
        HERO SLIDER
========================= */

const slides =
document.querySelectorAll(".slide");

let currentSlide = 0;

function showSlide(index){

  slides.forEach((slide)=>{

    slide.classList.remove("active");

  });

  slides[index].classList.add("active");

}

/* FIRST */

showSlide(currentSlide);

/* AUTO */

setInterval(()=>{

  currentSlide++;

  if(currentSlide >= slides.length){

    currentSlide = 0;

  }

  showSlide(currentSlide);

},4000);