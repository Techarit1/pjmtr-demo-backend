// routes/adminRoutes.js

const express = require('express');
const router = express.Router();

const {
  adminLogin,
  getAllPapers,
  updateStatus,
  approvePaper,
  deletePaper
} = require('../Controllers/adminController');

const authMiddleware = require('../Middleware/authMiddleware');
const adminMiddleware = require('../Middleware/adminmiddleware');
    

// ==============================
// 🔓 PUBLIC ROUTE
// ==============================

// Admin Login
router.post('/login', adminLogin);


// ==============================
// 🔐 PROTECTED ADMIN ROUTES
// ==============================

// Get all papers
router.get(
  '/papers',
  authMiddleware,
  adminMiddleware,
  getAllPapers
);

// Update paper status (Accepted / Rejected / etc.)
router.put(
  '/status/:id',
  authMiddleware,
  adminMiddleware,
  updateStatus
);

// Approve paper
router.put(
  '/approve/:id',
  authMiddleware,
  adminMiddleware,
  approvePaper
);

// Delete paper
router.delete(
  '/papers/:id',
  authMiddleware,
  adminMiddleware,
  deletePaper
);


// ==============================
// 🚀 EXPORT
// ==============================

module.exports = router;
