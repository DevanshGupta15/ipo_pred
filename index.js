const express = require('express');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// Create a write stream (in append mode) to save logs to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'log_api_request.txt'), { flags: 'a' });

// Morgan format to log method, URL, status, response time, and IP address
const morganFormat = ':method :url :status :res[content-length] - :response-time ms - IP: :remote-addr';

// Use morgan for logging and output to the file
app.use(morgan(morganFormat, { stream: logStream }));

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);


app.use(express.static('frontend/browser'))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/browser', 'index.html'));
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
