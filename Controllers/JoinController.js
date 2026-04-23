// Controllers/JoinController.js
const JoinApplication = require("../Models/JoinApplication");

// Create application
exports.createJoinApplication = async (req, res) => {
  try {
   const { fullName, email, role, experience, message } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "CV file is required" });
    }

   const newApp = new JoinApplication({
  fullName,
  email,
  role,
  experience,
  message,
  cvFile: {
    data: req.file.buffer,
    contentType: req.file.mimetype,
    filename: req.file.originalname
  }
});
    await newApp.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ message: "Failed to create application" });
  }
};

// Get all applications
exports.getAllJoinApplications = async (req, res) => {
  try {
    const applications = await JoinApplication.find().select("-cvFile.data"); // exclude file binary in list
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// Download CV
exports.downloadCV = async (req, res) => {
  try {
    const application = await JoinApplication.findById(req.params.id);
    if (!application || !application.cvFile || !application.cvFile.data) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.set({
      "Content-Type": application.cvFile.contentType,
      "Content-Disposition": `attachment; filename="${application.cvFile.filename}"`
    });
    res.send(application.cvFile.data);
  } catch (error) {
    console.error("Error downloading CV:", error);
    res.status(500).json({ message: "Failed to download CV" });
  }
};
