const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: String,
  keywords: String,
  authors: [{ name: String }],
  publishedOn: { type: String },
  publishedIn: { type: String },
  country: { type: String },

  researchArea: {
    type: String,
    trim: true
  },

  language: {
    type: String,
    trim: true
  },

  affiliationAddress: {
    type: String,
    trim: true
  },

  correspondingEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

 views: {
  type: Number,
  default: 0
},

downloads: {
  type: Number,
  default: 0
}, // ✅ comma add

pdf: { type: Buffer },
  createdAt: { type: Date, default: Date.now }
});
const issueSchema = new mongoose.Schema({
  issueNumber: { type: Number, required: true },
  month: String,
  year: Number,
  papers: [paperSchema]
});

const volumeSchema = new mongoose.Schema({
  volumeNumber: { type: Number, required: true, unique: true },
  issues: [issueSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Volume", volumeSchema);
