const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const projectRoot = path.join(__dirname, '..');

console.log('📦 Preparing Electron files for build...');

// Copy main.js as electron.js
fs.copyFileSync(
  path.join(projectRoot, 'main.js'),
  path.join(buildDir, 'electron.js')
);

// Copy preload.js
fs.copyFileSync(
  path.join(projectRoot, 'preload.js'),
  path.join(buildDir, 'preload.js')
);

// Copy resources folder if it exists
const resourcesSrc = path.join(projectRoot, 'resources');
const resourcesDest = path.join(buildDir, 'resources');
if (fs.existsSync(resourcesSrc)) {
  // Create destination directory
  if (!fs.existsSync(resourcesDest)) {
    fs.mkdirSync(resourcesDest, { recursive: true });
  }
  
  // Copy resources recursively
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(resourcesSrc, resourcesDest);
  console.log('  ✓ Resources folder copied');
}

// Read and update package.json for build directory
const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
);

// Create a minimal package.json for the build
const buildPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: 'electron.js',
  dependencies: {
    sharp: packageJson.dependencies.sharp
  }
};

fs.writeFileSync(
  path.join(buildDir, 'package.json'),
  JSON.stringify(buildPackageJson, null, 2)
);

// Verify files exist and are readable
const filesToCheck = [
  { path: path.join(buildDir, 'electron.js'), name: 'electron.js' },
  { path: path.join(buildDir, 'preload.js'), name: 'preload.js' },
  { path: path.join(buildDir, 'package.json'), name: 'package.json' }
];

for (const file of filesToCheck) {
  if (!fs.existsSync(file.path)) {
    throw new Error(`${file.name} not found in build directory`);
  }
  const stats = fs.statSync(file.path);
  if (stats.size === 0) {
    throw new Error(`${file.name} is empty in build directory`);
  }
  console.log(`  ✓ ${file.name} (${stats.size} bytes)`);
}

console.log('✅ Electron files prepared');

