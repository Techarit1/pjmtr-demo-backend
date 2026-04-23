const Volume = require("../Models/Volume");

// Create Volume
exports.createVolume = async (req, res) => {
  try {
    const { volumeNumber } = req.body;
    if (!volumeNumber) return res.status(400).json({ message: "Volume number required" });

    let existing = await Volume.findOne({ volumeNumber });
    if (existing) return res.status(400).json({ message: "Volume already exists" });

    const volume = new Volume({ volumeNumber, issues: [] });
    await volume.save();
    res.status(201).json(volume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Volume
exports.deleteVolume = async (req, res) => {
  try {
    const { id } = req.params;
    await Volume.findByIdAndDelete(id);
    res.json({ message: "Volume deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Issue
exports.createIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issueNumber, month, year } = req.body;

    const volume = await Volume.findById(id);
    if (!volume) return res.status(404).json({ message: "Volume not found" });

    volume.issues.push({ issueNumber, month, year, papers: [] });
    await volume.save();
    res.json(volume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Issue
exports.deleteIssue = async (req, res) => {
  try {
    const { volumeId, issueId } = req.params;

    const updated = await Volume.findByIdAndUpdate(
      volumeId,
      { $pull: { issues: { _id: issueId } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Volume not found" });
    }

    res.json({ message: "Issue deleted successfully", updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Add Paper
exports.addPaper = async (req, res) => {
  try {
    const { volumeId, issueId } = req.params;
    const { title, abstract, keywords, authors, publishedOn, publishedIn, country } = req.body;
    const pdfBuffer = req.file ? req.file.buffer : null;

    const volume = await Volume.findById(volumeId);
    if (!volume) return res.status(404).json({ message: "Volume not found" });

    const issue = volume.issues.id(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.papers.push({
      title,
      abstract,
      keywords,
      authors: JSON.parse(authors),
      publishedOn,
      publishedIn,
      country,
      researchArea: req.body.researchArea,
  language: req.body.language,
  affiliationAddress: req.body.affiliationAddress,
  correspondingEmail: req.body.correspondingEmail,
      pdf: pdfBuffer
    });

    await volume.save();
    res.json(volume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get All Volumes
exports.getVolumes = async (req, res) => {
  try {
    const volumes = await Volume.find().sort({ volumeNumber: -1 });
    res.json(volumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download Paper PDF
exports.downloadPaper = async (req, res) => {
  try {
    const { volumeId, issueId, paperId } = req.params;

    const volume = await Volume.findById(volumeId);
    if (!volume) return res.status(404).json({ message: "Volume not found" });

    const issue = volume.issues.id(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const paper = issue.papers.id(paperId);
    if (!paper || !paper.pdf) return res.status(404).json({ message: "PDF not found" });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${paper.title}.pdf"`
    });
    res.send(paper.pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getPaper = async (req, res) => {
  try {
    const { volumeId, issueId, paperId } = req.params;

    const volume = await Volume.findById(volumeId);

    if (!volume) {
      return res.status(404).json({ message: "Volume not found" });
    }

    const issue = volume.issues.id(issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const paper = issue.papers.id(paperId);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    res.json(paper);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Delete Paper
exports.deletePaper = async (req, res) => {
  try {
    const { volumeId, issueId, paperId } = req.params;

    const volume = await Volume.findById(volumeId);
    if (!volume) return res.status(404).json({ message: "Volume not found" });

    const issue = volume.issues.id(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const paper = issue.papers.id(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    // Remove paper
    paper.remove();

    await volume.save();

    res.json({ message: "Paper deleted successfully", volume });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Update Paper
exports.updatePaper = async (req, res) => {
  try {
    const { volumeId, issueId, paperId } = req.params;

    const {
      title,
      abstract,
      keywords,
      authors,
      publishedOn,
      publishedIn,
      country,
      researchArea,
      language,
      affiliationAddress,
      correspondingEmail
    } = req.body;
      if (!Object.keys(req.body).length && !req.file) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const volume = await Volume.findById(volumeId);
    if (!volume) return res.status(404).json({ message: "Volume not found" });

    const issue = volume.issues.id(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const paper = issue.papers.id(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    // Update fields (only if provided)
    if (title) paper.title = title;
    if (abstract) paper.abstract = abstract;
    if (keywords) paper.keywords = keywords;
    if (authors) paper.authors = JSON.parse(authors);
    if (publishedOn) paper.publishedOn = publishedOn;
    if (publishedIn) paper.publishedIn = publishedIn;
    if (country) paper.country = country;
    if (researchArea) paper.researchArea = researchArea;
    if (language) paper.language = language;
    if (affiliationAddress) paper.affiliationAddress = affiliationAddress;
    if (correspondingEmail) paper.correspondingEmail = correspondingEmail;

    // If new PDF uploaded
    if (req.file) {
      paper.pdf = req.file.buffer;
    }

    await volume.save();

    res.json({ message: "Paper updated successfully", paper });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
