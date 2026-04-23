// backend/Models/Paper.js
const mongoose = require("mongoose");

// ==============================
// Sub-schemas
// ==============================

// Author sub-schema
const authorSchema = new mongoose.Schema({
  salutation: String,
  firstName: String,
  middleName: String,
  lastName: String,
  designation: String,
  department: String,
  organization: String,
  email: String,
  mobile: String,
  country: String,
  address: String,
  orcid: String,
});

// Reviewer sub-schema
const reviewerSchema = new mongoose.Schema({
  name: String,
  email: String,
  institution: String,
});

// File sub-schema
const fileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer,
});

// ==============================
// Main Paper Schema
// ==============================
const paperSchema = new mongoose.Schema({
  // Basic details
    manuscriptType: { type: String, required: true }, 
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: { type: String, required: true },
  researchArea: { type: String, required: true },

  // Authors array
  authors: [authorSchema],

  // Contact info
  country: String,
  state: String,
  city: String,
  postalCode: String,
  address: String,
  message: String,

  // Questionnaire / Declarations
  ethicalApproval: { type: String },
  ethicalApprovalNumber: { type: String },
  conflictOfInterest: { type: String },
  conflictDetails: { type: String },
  fundingSupport: { type: String },
  fundingAmount: { type: String },
  fundingInstitution: { type: String },

  // Reviewers
  reviewers: [reviewerSchema],
  nonPreferredReviewer: { type: String },

  // Agreement
  agreement: { type: Boolean, default: false },

  // Uploaded files
  file: fileSchema,
  coverLetter: fileSchema,
  supplementaryFile: fileSchema,

  // Application ID (auto-generated)
  applicationId: {
    type: String,
    default: () => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      return `PJMTR${randomDigits}`;
    },
    unique: true,
  },

  // Status tracking
  status: {
    type: String,
    enum: ["Under Reviewing", "Approved", "Rejected"],
    default: "Under Reviewing",
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
});

// ==============================
// Export model
// ==============================
module.exports = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
