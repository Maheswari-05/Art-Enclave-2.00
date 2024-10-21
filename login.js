const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = 'mongodb://localhost:27017/';
const dbName = 'Login';

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());

let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => console.error('MongoDB connection error:', error));

app.post('/login', async (req, res) => {
  console.log('Received login request:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db.collection('users').findOne({ email });
    console.log('Found user:', user);

    if (user && user.password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Add a test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});