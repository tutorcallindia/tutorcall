const express =
require("express");

const router =
express.Router();

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const User =
require("../models/User");

/* ===============================
      SIGNUP
================================ */

router.post(

"/signup",

async(req,res)=>{

try{

const {

name,
email,
password,
role

} = req.body;

const existingUser =
await User.findOne({
email
});

if(existingUser){

return res.json({

message:
"Email already exists"

});

}

const hashedPassword =
await bcrypt.hash(
password,
10
);

const user =
new User({

name,

email,

password:
hashedPassword,

role

});

await user.save();

const token =
jwt.sign(

{
id:user._id
},

"tutorsecret",

{
expiresIn:"7d"
}

);

res.json({

message:
"Signup Successful",

token,

user:{

name:user.name,

email:user.email,

role:user.role

}

});
}catch(error){

console.log(error);

res.status(500).json({

message:
"Signup Failed"

});

}

}

/* ===============================
      LOGIN
================================ */

);

router.post(

"/login",

async(req,res)=>{

try{

const {

email,
password

} = req.body;

const user =
await User.findOne({
email
});

if(!user){

return res.json({

message:
"User not found"

});

}

const isMatch =
await bcrypt.compare(

password,

user.password

);

if(!isMatch){

return res.json({

message:
"Wrong password"

});

}

const token =
jwt.sign(

{
id:user._id
},

"SECRETKEY123",

{
expiresIn:"7d"
}

);

res.json({

message:
"Login Successful",

token,

user

});

}catch(error){

console.log(error);

res.status(500).json({

message:
"Login Failed"

});

}

}

);

module.exports =
router;
/* ===============================
      GET ALL USERS
================================ */

router.get(

"/users",

async(req,res)=>{

try{

const users =
await User.find();

res.json(users);

}catch(error){

console.log(error);

res.status(500).json({

message:
"Error fetching users"

});

}

}

);