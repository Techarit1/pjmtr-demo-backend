const Admin = require('../Models/Admin');
const Paper = require('../Models/Paper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  try {
    console.log("LOGIN API HIT"); // 🔥 ADD THIS

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Admin not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("TOKEN GENERATED"); // 🔥

    return res.json({ token }); // ✅ IMPORTANT (return)
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPapers = async (req, res) => {
  const papers = await Paper.find().sort({ createdAt: -1 });
  res.json(papers);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const paper = await Paper.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!paper) return res.status(404).json({ message: 'Paper not found' });
  res.json({ message: `Paper ${status}`, paper });
};
exports.approvePaper = async (req, res) => {
  try {
    const paper = await Paper.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    res.json({ message: 'Paper approved successfully', paper });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};
exports.deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findByIdAndDelete(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json({ message: 'Paper deleted successfully', paper });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete paper', error: error.message });
  }
};
