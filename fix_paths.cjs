const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  content = content.replace(/'\/official-logos/g, "'/UPGOV/official-logos");
  content = content.replace(/"\/official-logos/g, "\"/UPGOV/official-logos");
  content = content.replace(/'\/hero-bg\.mp4'/g, "'/UPGOV/hero-bg.mp4'");
  content = content.replace(/"\/hero-bg\.mp4"/g, "\"/UPGOV/hero-bg.mp4\"");
  content = content.replace(/'\/tutorial\.mp4'/g, "'/UPGOV/tutorial.mp4'");
  content = content.replace(/"\/tutorial\.mp4"/g, "\"/UPGOV/tutorial.mp4\"");
  content = content.replace(/'\/tutorial-hi\.mp4'/g, "'/UPGOV/tutorial-hi.mp4'");
  content = content.replace(/"\/tutorial-hi\.mp4"/g, "\"/UPGOV/tutorial-hi.mp4\"");
  content = content.replace(/'\/civic-complaint/g, "'/UPGOV/civic-complaint");
  content = content.replace(/"\/civic-complaint/g, "\"/UPGOV/civic-complaint");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src'));
