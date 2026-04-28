const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const paperRoutes = require('./routes/paperRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const newsRoutes = require('./routes/News.js'); // ✅ This is your route handler, not the model
const topBarRoutes = require("./routes/topBarroutes");
const joinRoutes = require('./routes/Join.js'); // ✅ Correct import for join routes
const path = require("path");

const Volume = require("./Models/Volume"); // ✅ 🔥 ADD THIS (IMPORTANT)

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS Middleware - should be before routes
app.use(cors({
  origin: [
    'https://darkslateblue-pony-528056.hostingersite.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//  JSON parsing
app.use(express.json());

//  API routes
app.use('/api/news', newsRoutes);      
app.use('/api/papers', paperRoutes);

app.use('/api/admin', adminRoutes);
app.use("/api/topbar", topBarRoutes);
app.use('/api/join', joinRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes

app.use("/api/volumes", require("./routes/VolumeRoutes"));

const Paper = require("./Models/Paper"); // 👈 (same as before, untouched)

app.get("/paper/view/:id", async (req, res) => {
  try {
    const volume = await Volume.findOne({
      "issues.papers._id": req.params.id
    });

    if (!volume) {
      return res.status(404).send("Paper not found");
    }

    let paper = null;

    volume.issues.forEach(issue => {
      issue.papers.forEach(p => {
        if (p._id.toString() === req.params.id) {
          paper = p;
        }
      });
    });

    if (!paper || !paper.pdf) {
      return res.status(404).send("PDF not found");
    }

    // 🔥 (VIEW COUNT)
    await Volume.updateOne(
      { "issues.papers._id": req.params.id },
      { $inc: { "issues.$[].papers.$[p].views": 1 } },
      {
        arrayFilters: [{ "p._id": req.params.id }]
      }
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=paper.pdf",
    });

    const pdfData = paper.pdf;

    let finalBuffer;

    // 🔥 HANDLE ALL CASES
    if (pdfData.buffer) {
      finalBuffer = Buffer.from(pdfData.buffer);
    } else if (pdfData instanceof ArrayBuffer) {
      finalBuffer = Buffer.from(pdfData);
    } else if (pdfData.data) {
      finalBuffer = Buffer.from(pdfData.data);
    } else {
      finalBuffer = Buffer.from(pdfData);
    }

    res.end(finalBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
