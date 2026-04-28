const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const paperRoutes = require('./routes/paperRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const newsRoutes = require('./routes/News.js');
const topBarRoutes = require("./routes/topBarroutes");
const joinRoutes = require('./routes/Join.js');
const path = require("path");

const Volume = require("./Models/Volume");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: [
    'https://darkslateblue-pony-528056.hostingersite.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/news', newsRoutes);      
app.use('/api/papers', paperRoutes);

app.use('/api/admin', adminRoutes);
app.use("/api/topbar", topBarRoutes);
app.use('/api/join', joinRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/volumes", require("./routes/VolumeRoutes"));

const Paper = require("./Models/Paper");


// ===================== VIEW ROUTE =====================
app.get("/paper/view/:id", async (req, res) => {
  try {
    const volume = await Volume.findOne({
      "issues.papers._id": req.params.id
    });

    if (!volume) {
      return res.status(404).send("Paper not found");
    }

    let paper = null;
    let issueIndex = -1;
    let paperIndex = -1;

    volume.issues.forEach((issue, i) => {
      issue.papers.forEach((p, j) => {
        if (p._id.toString() === req.params.id) {
          paper = p;
          issueIndex = i;
          paperIndex = j;
        }
      });
    });

    if (!paper || !paper.pdf) {
      return res.status(404).send("PDF not found");
    }

    // 🔥 VIEW COUNT
    if (issueIndex !== -1 && paperIndex !== -1) {
      await Volume.updateOne(
        { _id: volume._id },
        {
          $inc: {
            [`issues.${issueIndex}.papers.${paperIndex}.views`]: 1
          }
        }
      );
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=paper.pdf",
    });

    const pdfData = paper.pdf;

    let finalBuffer;
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


// ===================== DOWNLOAD ROUTE =====================
app.get("/paper/download/:id", async (req, res) => {
  try {
    const volume = await Volume.findOne({
      "issues.papers._id": req.params.id
    });

    if (!volume) {
      return res.status(404).send("Paper not found");
    }

    let paper = null;
    let issueIndex = -1;
    let paperIndex = -1;

    volume.issues.forEach((issue, i) => {
      issue.papers.forEach((p, j) => {
        if (p._id.toString() === req.params.id) {
          paper = p;
          issueIndex = i;
          paperIndex = j;
        }
      });
    });

    if (!paper || !paper.pdf) {
      return res.status(404).send("PDF not found");
    }

    // 🔥 DOWNLOAD COUNT
    if (issueIndex !== -1 && paperIndex !== -1) {
      await Volume.updateOne(
        { _id: volume._id },
        {
          $inc: {
            [`issues.${issueIndex}.papers.${paperIndex}.downloads`]: 1
          }
        }
      );
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=paper.pdf",
    });

    const pdfData = paper.pdf;

    let finalBuffer;
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


// ===================== DB CONNECTION =====================
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
