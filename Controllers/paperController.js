// backend/Controllers/paperController.js
const Paper = require("../Models/Paper");

// ==============================
// Submit Paper
// ==============================
exports.submitPaper = async (req, res) => {
  try {
    const {
      manuscriptType,
      title,
      abstract,
      keywords,
      researchArea,
      authors,
      country,
      state,
      city,
      postalCode,
      address,
      message,
      ethicalApproval,
      ethicalApprovalNumber,
      conflictOfInterest,
      conflictDetails,
      fundingSupport,
      fundingAmount,
      fundingInstitution,
      reviewers,
      nonPreferredReviewer,
      agreement,
    } = req.body;

    // ==============================
    // Handle Uploaded Files
    // ==============================
    const manuscriptFile = req.files?.manuscriptFile?.[0];
    const coverLetter = req.files?.coverLetter?.[0];
    const supplementaryFile = req.files?.supplementaryFile?.[0];

    // ==============================
    // Parse Authors Safely
    // ==============================
    let authorsArray = [];
    if (authors) {
      if (typeof authors === "string") {
        try {
          authorsArray = JSON.parse(authors);
        } catch {
          authorsArray = [];
        }
      } else if (Array.isArray(authors)) {
        authorsArray = authors;
      }
    }

    const formattedAuthors = authorsArray.map((a) => ({
      salutation: a.salutation || "",
      firstName: a.firstName || "",
      middleName: a.middleName || "",
      lastName: a.lastName || "",
      designation: a.designation || "",
      department: a.department || "",
      organization: a.organization || "",
      email: a.email || "",
      mobile: a.mobile || "",
      country: a.country || "",
      address: a.address || "",
      orcid: a.orcid || "",
    }));

    // ==============================
    // Parse Reviewers Safely
    // ==============================
    let reviewersArray = [];
    if (reviewers) {
      if (typeof reviewers === "string") {
        try {
          reviewersArray = JSON.parse(reviewers);
        } catch {
          reviewersArray = [];
        }
      } else if (Array.isArray(reviewers)) {
        reviewersArray = reviewers;
      }
    }

    const formattedReviewers = reviewersArray.map((r) => ({
      name: r.name || "",
      email: r.email || "",
      institution: r.institution || "",
    }));

    // ==============================
    // Create New Paper
    // ==============================
    const newPaper = new Paper({
      manuscriptType,
      title,
      abstract,
      keywords,
      researchArea,
      authors: formattedAuthors,
      country,
      state,
      city,
      postalCode,
      address,
      message,
      ethicalApproval,
      ethicalApprovalNumber,
      conflictOfInterest,
      conflictDetails,
      fundingSupport,
      fundingAmount,
      fundingInstitution,
      reviewers: formattedReviewers,
      nonPreferredReviewer,
      agreement: agreement === "true" || agreement === true,
      file: manuscriptFile
        ? {
            filename: manuscriptFile.originalname,
            contentType: manuscriptFile.mimetype,
            data: manuscriptFile.buffer,
          }
        : undefined,
      coverLetter: coverLetter
        ? {
            filename: coverLetter.originalname,
            contentType: coverLetter.mimetype,
            data: coverLetter.buffer,
          }
        : undefined,
      supplementaryFile: supplementaryFile
        ? {
            filename: supplementaryFile.originalname,
            contentType: supplementaryFile.mimetype,
            data: supplementaryFile.buffer,
          }
        : undefined,
    });

    await newPaper.save();

    res
      .status(201)
      .json({
        message: "Paper submitted successfully",
        id: newPaper._id,
        applicationId: newPaper.applicationId,
      });
  } catch (error) {
    console.error("Error submitting paper:", error);
    res.status(500).json({ error: "Server error while submitting paper" });
  }
};

// ==============================
// Get All Papers (Admin Dashboard)
// ==============================
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.find().sort({ createdAt: -1 });
    res.json(papers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch papers", error: err.message });
  }
};

// ==============================
// Get Status of a Paper
// ==============================
exports.getStatus = async (req, res) => {
  try {
    const paper = await Paper.findOne({ applicationId: req.params.id });

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    res.json({
      title: paper.title,
      applicationId: paper.applicationId,
      status: paper.status,
      createdAt: paper.createdAt,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get status",
      error: err.message,
    });
  }
};

// ==============================
// Get File by ID (Download Manuscript)
// ==============================
exports.getFileById = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper || !paper.file)
      return res.status(404).json({ message: "File not found" });

    res.set({
      "Content-Type": paper.file.contentType,
      "Content-Disposition": `attachment; filename="${paper.file.filename}"`,
    });

    res.send(paper.file.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to download file", error: err.message });
  }
};

// ==============================
// Approve Paper
// ==============================
exports.approvePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.status = "Approved";
    await paper.save();

    const emails = paper.authors.map((a) => a.email);
    res.json({ message: "Paper approved", emails, title: paper.title });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

// ==============================
// Reject Paper
// ==============================
exports.rejectPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.status = "Rejected";
    await paper.save();

    const emails = paper.authors.map((a) => a.email);
    res.json({ message: "Paper rejected", emails, title: paper.title });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

// ==============================
// Delete Paper
// ==============================
exports.deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findByIdAndDelete(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    const emails = paper.authors.map((a) => a.email);
    res.json({ message: "Paper deleted", emails, title: paper.title });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete paper", error: err.message });
  }
};
