const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/artistportal', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB:', error));

// Define Schema and Model for artworks
const artworkSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  artist: String,
  createdAt: { type: Date, default: Date.now }
});

const Artwork = mongoose.model('Artwork', artworkSchema);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload artwork endpoint
app.post('/upload-artwork', upload.single('image'), async (req, res) => {
  try {
    const newArtwork = new Artwork({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      artist: req.body.artist || 'Unknown Artist',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });
    
    await newArtwork.save();
    res.status(201).json({ message: 'Artwork uploaded successfully!', artwork: newArtwork });
  } catch (error) {
    res.status(400).json({ error: 'Error uploading artwork: ' + error.message });
  }
});

// Fetch all artworks endpoint
app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching artworks: ' + error.message });
  }
});

// Fetch single artwork by ID endpoint
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    console.log('Requested artwork ID:', req.params.id);
    console.log('Found artwork:', artwork);
    
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Error fetching artwork: ' + error.message });
  }
});

// Start the server
const PORT = 3011;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});