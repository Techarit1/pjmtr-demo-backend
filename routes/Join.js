// routes/join.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const JoinController = require("../Controllers/JoinController");

// Use memoryStorage for storing file in MongoDB as binary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create join application (with file upload)
router.post("/", upload.single("cvFile"), JoinController.createJoinApplication);

// Get all applications (without file data)
router.get("/", JoinController.getAllJoinApplications);

// Download CV by ID
router.get("/download/:id", JoinController.downloadCV);

module.exports = router;
