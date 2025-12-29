const { execSync } = require('child_process');
const fs = require('fs');

console.log('Generating package-lock.json...');

try {
  // Remove existing lockfile and node_modules if present
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  
  // Generate new package-lock.json
  execSync('npm install --package-lock-only', { stdio: 'inherit' });
  
  console.log('✓ package-lock.json generated successfully');
} catch (error) {
  console.error('Error generating lockfile:', error.message);
  process.exit(1);
}
