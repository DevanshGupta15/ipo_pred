const express = require('express');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

let totalApiCalls = 0; // Counter for total API calls
const uniqueUsers = new Set(); // Set to track unique users

// Create a write stream (in append mode) to save logs to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'log_api_request.txt'), { flags: 'a' });

// Morgan format to log method, URL, status, and response time
const morganFormat = ':method :url :status - :response-time ms - IP: :remote-addr';

// Use morgan for logging and output to the file
app.use(
  morgan(morganFormat, {
    stream: logStream,
    skip: (req, res) => {
      totalApiCalls++; // Increment the API call counter
      uniqueUsers.add(req.ip); // Add the user's IP to the unique users set
      return false;
    },
  })
);

// Log useful metrics on each API call
app.use((req, res, next) => {
  console.log(`[API] Total Calls: ${totalApiCalls}, Unique Users: ${uniqueUsers.size}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Metrics endpoint to view current metrics
app.get('/metrics', (req, res) => {
  res.json({
    totalApiCalls,
    totalUniqueUsers: uniqueUsers.size,
  });
});

// Serve static frontend files
app.use(express.static('frontend/browser'));

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/browser', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Log the server URL on startup
app.listen(PORT, () => {
  const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`Server running on ${serverUrl}`);
});
