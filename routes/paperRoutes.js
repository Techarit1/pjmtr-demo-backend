// backend/Routes/paperRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import controller functions
const {
  submitPaper,
  getStatus,
  getFileById,
  approvePaper,
  rejectPaper,
  deletePaper,
  getAllPapers // ✅ Make sure this is exported in paperController.js
} = require('../Controllers/paperController');

// =============================
// Multer Storage (In-Memory)
// =============================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =============================
// Routes
// =============================

// Submit paper with 3 files: manuscript, cover letter, supplementary file
router.post(
  '/submit',
  upload.fields([
    { name: 'manuscriptFile', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'supplementaryFile', maxCount: 1 },
  ]),
  submitPaper
);

// Get status of a paper by ID
router.get('/status/:id', getStatus);

// Get file by paper ID
router.get('/file/:id', getFileById);

// Approve a paper
router.put('/approve/:id', approvePaper);

// Reject a paper
router.put('/reject/:id', rejectPaper);

// Delete a paper
router.delete('/delete/:id', deletePaper);

module.exports = router;
