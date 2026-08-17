const fs = require('fs');
const path = require('path');

const adminAppPath = path.join(process.cwd(), 'admin/src/App.tsx');
let adminContent = fs.readFileSync(adminAppPath, 'utf8');

// Replace static imports with React.lazy
adminContent = adminContent.replace(/import (.*?) from "@\/pages\/(.*?)";/g, 'const $1 = React.lazy(() => import("@/pages/$2"));');
// Add Suspense and React
if (!adminContent.includes('import React')) {
  adminContent = `import React, { Suspense } from "react";\n` + adminContent;
}

// Fix missing admin routes
adminContent = adminContent.replace(/const Admin = React\.lazy\(\(\) => import\("@\/pages\/admin\/Admin"\)\);/g, 'const Admin = React.lazy(() => import("./pages/Admin"));');
adminContent = adminContent.replace(/const SuperAdmin = React\.lazy\(\(\) => import\("@\/pages\/admin\/SuperAdmin"\)\);/g, 'const SuperAdmin = React.lazy(() => import("./pages/SuperAdmin"));');
adminContent = adminContent.replace(/const SignIn = React\.lazy\(\(\) => import\("@\/pages\/admin\/SignIn"\)\);/g, 'const SignIn = React.lazy(() => import("./pages/SignIn"));');

// Wrap Router Switch in Suspense
adminContent = adminContent.replace(/<Switch>/g, '<Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>\n      <Switch>');
adminContent = adminContent.replace(/<\/Switch>/g, '</Switch>\n    </Suspense>');

fs.writeFileSync(adminAppPath, adminContent, 'utf8');

const candidateAppPath = path.join(process.cwd(), 'candidate/src/App.tsx');
let candidateContent = fs.readFileSync(candidateAppPath, 'utf8');

candidateContent = candidateContent.replace(/import (.*?) from "@\/pages\/(.*?)";/g, 'const $1 = React.lazy(() => import("@/pages/$2"));');

if (!candidateContent.includes('import React')) {
  candidateContent = `import React, { Suspense } from "react";\n` + candidateContent;
}

// Fix candidate routes
candidateContent = candidateContent.replace(/const JobSeekerAuth = React\.lazy\(\(\) => import\("@\/pages\/candidate\/JobSeekerAuth"\)\);/g, 'const JobSeekerAuth = React.lazy(() => import("./pages/JobSeekerAuth"));');
candidateContent = candidateContent.replace(/const JobSeekerDashboard = React\.lazy\(\(\) => import\("@\/pages\/candidate\/JobSeekerDashboard"\)\);/g, 'const JobSeekerDashboard = React.lazy(() => import("./pages/JobSeekerDashboard"));');
candidateContent = candidateContent.replace(/const SubmitResume = React\.lazy\(\(\) => import\("@\/pages\/candidate\/SubmitResume"\)\);/g, 'const SubmitResume = React.lazy(() => import("./pages/SubmitResume"));');

candidateContent = candidateContent.replace(/<Switch>/g, '<Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>\n      <Switch>');
candidateContent = candidateContent.replace(/<\/Switch>/g, '</Switch>\n    </Suspense>');

fs.writeFileSync(candidateAppPath, candidateContent, 'utf8');

console.log("Replaced imports with React.lazy in App.tsx files.");
