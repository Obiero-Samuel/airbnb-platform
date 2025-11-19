const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Debug route to see frontend structure
app.get('/debug-structure', (req, res) => {
  function getStructure(dir, indent = '') {
    let structure = '';
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          structure += `${indent}📁 ${item}/\n`;
          structure += getStructure(fullPath, indent + '  ');
        } else {
          structure += `${indent}📄 ${item}\n`;
        }
      }
    } catch (error) {
      structure = `Error reading directory: ${error.message}\n`;
    }
    return structure;
  }

  res.set('Content-Type', 'text/plain');
  res.send(`Frontend Structure:\n${getStructure(frontendPath)}`);
});

// Serve pages from the pages folder directly
app.get('/pages/:page', (req, res) => {
  const pageName = req.params.page;
  const pagesPath = path.join(frontendPath, 'pages', pageName);

  if (fs.existsSync(pagesPath)) {
    res.sendFile(pagesPath);
  } else {
    res.status(404).send(`Page ${pageName} not found`);
  }
});

// Dynamic route handler - serves any HTML file that exists
app.get('*', (req, res) => {
  let requestedPath = req.path;

  // Remove leading slash
  if (requestedPath.startsWith('/')) {
    requestedPath = requestedPath.substring(1);
  }

  // If empty path, serve index.html
  if (requestedPath === '') {
    requestedPath = 'index.html';
  }

  // If path doesn't have extension, assume it's HTML
  if (!path.extname(requestedPath)) {
    requestedPath += '.html';
  }

  const fullPath = path.join(frontendPath, requestedPath);

  // Check if file exists
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    // If file doesn't exist, serve a helpful error page
    res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Page Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                    .error { color: #d63031; }
                    .info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1 class="error">❌ Page Not Found</h1>
                <p>The requested page <strong>${req.path}</strong> was not found.</p>
                
                <div class="info">
                    <h3>Available Pages:</h3>
                    <p><a href="/">Home Page</a></p>
                    <p><a href="/debug-structure">View Folder Structure</a></p>
                    <p><a href="/api/properties">Backend API Test</a></p>
                </div>
                
                <div class="info">
                    <h3>Quick Links:</h3>
                    <p><a href="/index.html">index.html</a></p>
                    <p><a href="/pages/login.html">pages/login.html</a></p>
                    <p><a href="/pages/register.html">pages/register.html</a></p>
                    <p><a href="/pages/properties.html">pages/properties.html</a></p>
                </div>
            </body>
            </html>
        `);
  }
});

// API test route
app.get('/api', (req, res) => {
  res.json({
    message: 'Airbnb System API is running!',
    status: 'operational',
    endpoints: {
      properties: '/api/properties',
      popular: '/api/properties/popular',
      auth: '/api/auth',
      debug: '/debug-structure'
    }
  });
});

// Change port to 5000 to avoid conflict with any frontend dev server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏠 Frontend: http://localhost:${PORT}/`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📁 Debug: http://localhost:${PORT}/debug-structure`);
  console.log(`📄 Register: http://localhost:${PORT}/pages/register.html`);
  console.log(`Frontend path: ${frontendPath}`);
});