
console.log("TUTOR ROUTES FILE START");
console.log("TUTOR ROUTES FILE START");

const express = require("express");
console.log("Express loaded");

const router = express.Router();

console.log("Booking model loading");
const Booking = require("../models/booking");

console.log("JWT loading");
const jwt = require("jsonwebtoken");

console.log("Bcrypt loading");
const bcrypt = require("bcryptjs");

console.log("Tutor model loading");
const Tutor = require("../models/tutor");

console.log("Multer loading");
const multer = require("multer");

console.log("ALL TUTOR ROUTES DEPENDENCIES LOADED");



