const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const v1Dir = path.join(routesDir, 'v1');

if (!fs.existsSync(v1Dir)) {
  fs.mkdirSync(v1Dir);
}

const files = fs.readdirSync(routesDir);

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  // Only move .js files, not directories
  if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace require('../ to require('../../
    content = content.replace(/require\(['"]\.\.\//g, "require('../../");
    
    const newPath = path.join(v1Dir, file);
    fs.writeFileSync(newPath, content, 'utf8');
    fs.unlinkSync(filePath);
    console.log(`Moved and updated ${file}`);
  }
});

console.log('Done migrating routes to v1');
