const fs = require('fs');
const path = require('path');

// Ensure the deployment directory exists
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy the server files
const filesToCopy = [
  'index.js',
  'web.config',
  '.env',
  'azure-deploy-package.json' // Our deployment package.json
];

const directoriesToCopy = [
  'public',
  'database',
  'server'
];

// Copy files
filesToCopy.forEach(file => {
  try {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(deployDir, file === 'azure-deploy-package.json' ? 'package.json' : file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to deploy directory`);
    } else {
      console.log(`Warning: File ${file} not found, skipping`);
    }
  } catch (err) {
    console.error(`Error copying ${file}:`, err);
  }
});

// Copy directories recursively
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Copy the static files from preview/dist
const previewDistPath = path.join(__dirname, '../preview/dist');
const deployStaticPath = path.join(deployDir, 'public/static');

if (fs.existsSync(previewDistPath)) {
  if (!fs.existsSync(deployStaticPath)) {
    fs.mkdirSync(deployStaticPath, { recursive: true });
  }
  
  copyDirectory(previewDistPath, deployStaticPath);
  console.log('Copied preview/dist to public/static directory');
}

// Copy directories
directoriesToCopy.forEach(dir => {
  try {
    const sourcePath = path.join(__dirname, dir);
    const destPath = path.join(deployDir, dir);
    
    if (fs.existsSync(sourcePath)) {
      copyDirectory(sourcePath, destPath);
      console.log(`Copied ${dir} directory to deploy directory`);
    } else {
      console.log(`Warning: Directory ${dir} not found, skipping`);
    }
  } catch (err) {
    console.error(`Error copying ${dir}:`, err);
  }
});

console.log('Deployment preparation completed successfully'); 