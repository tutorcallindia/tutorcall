const express =
require("express");

const router =
express.Router();

const multer =
require("multer");

const Book =
require("../models/Book");

/* ===============================
      MULTER STORAGE
================================ */

const storage =
multer.diskStorage({

destination:
function(req,file,cb){

cb(null,"uploads/");

},

filename:
function(req,file,cb){

cb(

null,

Date.now() +
"-" +
file.originalname

);

}

});

const upload =
multer({
storage:storage
});

/* ===============================
      ADD BOOK
================================ */

router.post(

"/add",

upload.single("image"),

async(req,res)=>{

try{

const newBook =
new Book({

title:req.body.title,

category:req.body.category,

price:req.body.price,

city:req.body.city,


description:req.body.description,

image:
req.file
? `http://127.0.0.1:3000/uploads/${req.file.filename}`
: ""

});

await newBook.save();

res.json({

message:
"Book Uploaded Successfully"

});

}catch(error){

console.log(error);

res.status(500).json({

message:
"Upload Failed"

});

}

}

);

/* ===============================
      GET BOOKS
================================ */

router.get(

"/",

async(req,res)=>{

try{

const books =
await Book.find();

res.json(books);

}catch(error){

res.status(500).json({

message:
"Error fetching books"

});

}

}

);


/* ===============================
      DELETE BOOK
================================ */

router.delete(

"/:id",

async(req,res)=>{

try{

await Book.findByIdAndDelete(
req.params.id
);

res.json({

message:
"Book Deleted"

});

}catch(error){

console.log(error);

res.status(500).json({

message:
"Delete Failed"

});

}

}

);

module.exports =
router;