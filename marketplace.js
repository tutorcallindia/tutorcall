async function loadBooks(){

  try{

    const response =
      await fetch(
        "http://127.0.0.1:3000/api/books"
      );

    const books =
      await response.json();

    console.log(books);

    const container =
      document.getElementById(
        "booksContainer"
      );

    container.innerHTML = "";

    books.forEach(book => {

      container.innerHTML += `

      <div class="book-card">

<img
src="${book.image}"
alt="${book.title}"
>
        <h3>
          ${book.title || "Book"}
        </h3>

        <p class="book-price">
          ₹${book.price || 0}
        </p>

        <p class="book-city">
          ${book.city || "India"}
        </p>
<div class="book-buttons">

<button
class="btn add-cart-btn"

data-id="${book._id}"

data-title="${book.title}"

data-price="${book.price}"

data-city="${book.city}"

data-image="${book.image}"

>

🛒 Add To Cart

</button>

<button
class="btn buy-btn">

⚡ Buy Now

</button>

</div>

      </div>

      `;

    });

  }catch(error){

    console.log(error);

  }

}

loadBooks();
/* ===============================
      ADD TO CART
================================ */

document.addEventListener(

"click",

function(event){

if(

event.target.classList.contains(
"add-cart-btn"
)

){

const button =
event.target;

const book = {

id:
button.dataset.id,

title:
button.dataset.title,

price:
button.dataset.price,

city:
button.dataset.city,

image:
button.dataset.image

};

let cart =
JSON.parse(

localStorage.getItem(
"cart"
)

) || [];

cart.push(book);

localStorage.setItem(

"cart",

JSON.stringify(cart)

);

alert(
"Book Added To Cart"
);

}

}
);