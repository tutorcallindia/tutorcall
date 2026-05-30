const mongoose =
require("mongoose");

const bookSchema =
new mongoose.Schema({

title:{
type:String,
required:true
},

price:{
type:Number,
required:true
},

city:{
type:String,
required:true
},

category:{
type:String
},

description:{
type:String
},

image:{
type:String
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports =
mongoose.model(
"Book",
bookSchema
);