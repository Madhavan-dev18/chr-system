const fs = require('fs');
const walk = (dir) => {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const path = dir + '/' + file;
    const stat = fs.statSync(path);
    if (stat && stat.isDirectory()) {
      walk(path);
    } else if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      let content = fs.readFileSync(path, 'utf8');
      let newContent = content;
      newContent = newContent.replace(/'SCHEDULED'/g, "'PENDING'");
      newContent = newContent.replace(/"SCHEDULED"/g, '"PENDING"');
      newContent = newContent.replace(/SCHEDULED:/g, 'PENDING:');
      newContent = newContent.replace(/scheduledAt/g, 'scheduledStart');
      newContent = newContent.replace(/endAt/g, 'scheduledEnd');
      if (content !== newContent) {
        fs.writeFileSync(path, newContent, 'utf8');
        console.log(`Updated ${path}`);
      }
    }
  }
};
walk('M:/Personal/Workspace/chr-system/apps/web');
