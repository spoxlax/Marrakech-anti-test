const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Critical Security Check
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined. Exiting.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5007;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting for Uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 uploads per windowMs
  message: 'Too many uploads from this IP, please try again later.'
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to verify API Key (for internal service calls)
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }
  return res.status(401).send('Unauthorized: Invalid API Key');
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.delete('/file', express.json(), (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).send('Filename is required.');
  }
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send('File deleted.');
  } else {
    res.status(404).send('File not found.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Uploads Service ready at http://localhost:${PORT}`);
});
