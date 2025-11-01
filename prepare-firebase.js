// prepare-firebase.js - Prepare Next.js build for Firebase hosting
const fs = require('fs');
const path = require('path');

console.log('🔥 Preparing Next.js build for Firebase hosting...');

// Clean and create out directory
const outDir = './out';
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy static assets
const staticDir = './.next/static';
if (fs.existsSync(staticDir)) {
  const outStaticDir = path.join(outDir, '_next/static');
  fs.mkdirSync(outStaticDir, { recursive: true });
  
  // Copy all static files
  function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyRecursive(staticDir, outStaticDir);
  console.log('✅ Copied static assets');
}

// Copy public directory
const publicDir = './public';
if (fs.existsSync(publicDir)) {
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(publicDir, entry.name);
    const destPath = path.join(outDir, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      function copyRecursive(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('✅ Copied public assets');
}

// Create main index.html that loads the app
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard - Loading</title>
    <link rel="icon" href="/favicon.ico">
    <meta name="description" content="Dashboard Application">
    <style>
        body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
        }
        .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e3e3e3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .dashboard-link {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.2s;
        }
        .dashboard-link:hover {
            background: #0056b3;
        }
        .error-message {
            color: #dc3545;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2>Loading Dashboard...</h2>
        <p>Initializing the application...</p>
        <a href="#" onclick="redirectToDashboard()" class="dashboard-link">Go to Dashboard</a>
        <div id="error-message" class="error-message" style="display: none;"></div>
    </div>
    
    <script>
        function redirectToDashboard() {
            // Since this is a SPA, we need to handle routing client-side
            const currentPath = window.location.pathname;
            console.log('Current path:', currentPath);
            
            // If we're on root, redirect to dashboard
            if (currentPath === '/' || currentPath === '/index.html') {
                window.location.href = '/dashboard';
            } else {
                // For other routes, try to load the appropriate page
                // This is a simple client-side router simulation
                loadPage(currentPath);
            }
        }
        
        function loadPage(path) {
            // This is where you'd implement client-side routing
            // For now, just redirect to dashboard
            if (path.startsWith('/dashboard')) {
                // Already on dashboard route - show message
                document.querySelector('.loading-container').innerHTML = 
                    '<h2>Dashboard Page</h2><p>This would be your dashboard content</p>' +
                    '<p>Current route: ' + path + '</p>' +
                    '<a href="/dashboard" class="dashboard-link">Main Dashboard</a>';
            } else {
                window.location.href = '/dashboard';
            }
        }
        
        // Auto-redirect after 2 seconds if user doesn't click
        setTimeout(() => {
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = '/dashboard';
            }
        }, 2000);
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            loadPage(window.location.pathname);
        });
        
        // Initialize
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            loadPage(window.location.pathname);
        }
    </script>
</body>
</html>`;

// Write index.html
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
console.log('✅ Created index.html');

// Create 404.html (Firebase will serve this for non-matching routes)
const notFoundHtml = indexHtml.replace(
  'Loading Dashboard...',
  'Page Not Found - Redirecting...'
).replace(
  'Initializing the application...',
  'Redirecting to dashboard...'
);

fs.writeFileSync(path.join(outDir, '404.html'), notFoundHtml);
console.log('✅ Created 404.html');

console.log('✨ Firebase preparation complete!');
console.log('📁 Files ready in ./out directory');
console.log('🚀 Deploy with: firebase deploy --only hosting');