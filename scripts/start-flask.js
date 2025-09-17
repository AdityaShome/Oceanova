const { spawn } = require('child_process');
const path = require('path');

// Change to the Ocean_details directory
const oceanDetailsPath = path.join(__dirname, '..', 'public', 'Ocean_details');

console.log('Starting Flask app from:', oceanDetailsPath);

// Start the Flask app
const flaskProcess = spawn('python', ['app.py'], {
  cwd: oceanDetailsPath,
  stdio: 'inherit',
  shell: true
});

flaskProcess.on('error', (error) => {
  console.error('Failed to start Flask app:', error);
  process.exit(1);
});

flaskProcess.on('close', (code) => {
  console.log(`Flask app exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping Flask app...');
  flaskProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping Flask app...');
  flaskProcess.kill('SIGTERM');
});
