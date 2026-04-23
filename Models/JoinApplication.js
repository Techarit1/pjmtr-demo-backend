// models/JoinApplication.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const generateAppId = () => {
  // e.g. PJMTR-2025-A1B2
  const year = new Date().getFullYear();
  const short = uuidv4().split('-')[0].slice(0, 4).toUpperCase();
  return `PJMTR-${year}-${short}`;
};

const joinApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, default: generateAppId },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Reviewer','Editorial Board Member','Research Contributor'], 
    default: 'Reviewer' 
  },
  experience: String,
  message: String,
  cvFile: {
    data: Buffer,          // File binary data
    contentType: String,   // MIME type
    filename: String       // Original file name
  },
  status: { 
    type: String, 
    enum: ['pending','accepted','rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

// ✅ Export with the name JoinApplication
module.exports = mongoose.model('JoinApplication', joinApplicationSchema);
