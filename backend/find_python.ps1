$env:PATH = "C:\node-v24.16.0-win-x64;$env:PATH"
node -e "const { exec } = require('child_process'); exec('where python', (err, stdout, stderr) => console.log('PYTHONPATH:', stdout.trim()))"
