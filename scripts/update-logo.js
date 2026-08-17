const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'admin/src/pages/SuperAdmin.tsx',
  'admin/src/pages/SignIn.tsx',
  'admin/src/pages/Admin.tsx',
  'candidate/src/pages/JobSeekerDashboard.tsx',
  'client/src/components/Header.tsx',
  'client/src/components/Footer.tsx'
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const newContent = content.replace(/Top_Logo_Tilcons_SkyBlue\.png/g, 'logo.webp');
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf-8');
      console.log(`Updated ${relPath}`);
    } else {
      console.log(`No changes needed for ${relPath}`);
    }
  } else {
    console.log(`File not found: ${relPath}`);
  }
}
