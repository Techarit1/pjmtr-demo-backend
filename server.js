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



const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware - should be before routes
app.use(cors({
  origin: [
    'http://localhost:5173',        
    'https://pjmtr.in' ,
    'https://www.pjmtr.in',
     'https://www.pjmtr.in/'
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
