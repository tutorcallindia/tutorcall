const mongoose =
  require("mongoose");

const bookSchema =
  new mongoose.Schema({

    title:String,

    author:String,

    publisher:String,

    price:String,

    city:String,

    pincode:String,

    delivery:String,

    description:String,

    image:String

  });

module.exports =
  mongoose.model(
    "Book",
    bookSchema
  );