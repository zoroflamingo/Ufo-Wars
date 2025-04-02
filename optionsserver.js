const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://localhost:4200', 
    methods: 'GET,POST',            
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],    credentials: true               // Include cookies or other credentials if needed
};

app.options('*', cors());
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});


// Database connection
const db = mysql.createConnection({
  host: 'wd.etsisi.upm.es',
  port: 3306,
  user: 'class',
  password: 'Class24_25',
  database: 'marsbd',
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.send('Welcome to the preferences server!');
  });  

// Endpoint to get preferences
app.get('/preferences/:username', (req, res) => {
  const username = req.params.username;
  console.log(username);
  const query = `SELECT ufos, time FROM prefView WHERE user = ?`;

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching preferences:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      res.json(results[0]); // Return preferences as JSON
    } else {
      res.status(404).json({ error: 'User preferences not found' }); // Return JSON for "not found"
    }
  });
});


// Endpoint to save preferences
app.post('/preferences', (req, res) => {
  const { username, ufos, time } = req.body;
  console.log({ username, ufos, time });
  if (!username || ufos === undefined || time === undefined) {
    res.status(400).json({erro: 'Invalid input'});
    return;
  }

  const query = `UPDATE prefView SET ufos = ?, time = ? WHERE user = ?`;
  
  db.query(query, [ufos, time, username], (err) => {
    if (err) {
      console.error('Error updating preferences:', err);
      res.status(500).json({ error: 'Internal server error' });      
      return;
    }

    res.status(200).json({message: 'Preferences saved'});  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
