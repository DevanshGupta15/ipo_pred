const express = require('express');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// In-memory counters (reset every time the server restarts)
let totalApiCalls = 0; // Counter for total API calls
const uniqueUsers = new Set(); // Set to track unique users
const responseTimes = []; // To track response times

// Create a write stream (in append mode) to save logs to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'log_api_request.txt'), { flags: 'a' });

// Morgan format to log method, URL, status, and response time
const morganFormat = ':method :url :status - :response-time ms - IP: :remote-addr';

// Middleware to track API call metrics and log detailed info
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start; // Calculate response time
    totalApiCalls++; // Increment total API calls
    uniqueUsers.add(req.ip); // Track unique users by IP

    // Log API call details
    console.log(`[API] Request: ${req.method} ${req.url}`);
    console.log(`[API] Status: ${res.statusCode}`);
    console.log(`[API] IP: ${req.ip}`);
    console.log(`[API] Duration: ${duration}ms`);
    console.log(`[Metrics] Total API Calls: ${totalApiCalls}`);
    console.log(`[Metrics] Total Unique Users: ${uniqueUsers.size}`);
  });

  next();
});

// Use Morgan for additional logging to file
app.use(morgan(morganFormat)); // This logs to the console
app.use(morgan(morganFormat, { stream: logStream }));

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Metrics endpoint to view current metrics
app.get('/metrics', (req, res) => {
  console.log('[Metrics Endpoint] Fetching current metrics...');
  res.json({
    totalApiCalls,
    totalUniqueUsers: uniqueUsers.size,
    averageResponseTime: calculateAverageResponseTime(),
    activeUsers: Array.from(uniqueUsers),
  });
});

// Health-check endpoint for server health
app.get('/health', (req, res) => {
  console.log('[Health Endpoint] Server Health Check...');
  res.json({
    status: 'ok',
    uptime: process.uptime(), // Server uptime in seconds
    totalApiCalls,
    totalUniqueUsers: uniqueUsers.size,
    activeUsers: Array.from(uniqueUsers),
    averageResponseTime: calculateAverageResponseTime(),
  });
});

// Serve static frontend files
app.use(express.static('frontend/browser'));

// Catch-all route for frontend
app.get('*', (req, res) => {
  console.log(`[Frontend] Serving file for: ${req.url}`);
  res.sendFile(path.join(__dirname, 'frontend/browser', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Log the server URL on startup
app.listen(PORT, () => {
  const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`Server running on ${serverUrl}`);
});

// Function to calculate average response time
function calculateAverageResponseTime() {
  if (responseTimes.length === 0) return 0;
  const total = responseTimes.reduce((sum, time) => sum + time, 0);
  return (total / responseTimes.length).toFixed(2);
}

// Middleware to capture response time for each request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    responseTimes.push(duration);
    console.log(`[Speed] Response time for ${req.method} ${req.url}: ${duration}ms`);
  });
  next();
});

// Middleware to periodically store metrics (e.g., every 5 minutes)
setInterval(() => {
  fs.appendFileSync(
    'metrics_log.txt',
    `Total API Calls: ${totalApiCalls}, Unique Users: ${uniqueUsers.size}, Average Response Time: ${calculateAverageResponseTime()}ms\n`
  );
}, 5 * 60 * 1000); // Every 5 minutes

