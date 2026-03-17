// Run this once with: node copy-pages.cjs
// It copies the 7 remaining page components to src/pages/
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const pagesDir = path.join(srcDir, "pages");

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

const files = [
  "SCM_Dashboard.jsx",
  "SCM_CaseCreation.jsx",
  "SCM_CaseDetail.jsx",
  "SCM_Review.jsx",
  "SCM_TransactionSearch.jsx",
  "SCM_Reports.jsx",
  "SCM_Settings.jsx",
];

for (const f of files) {
  const src = path.join(srcDir, f);
  const dst = path.join(pagesDir, f);
  if (!fs.existsSync(src)) {
    console.log(`SKIP (not found): ${f}`);
    continue;
  }
  fs.copyFileSync(src, dst);
  console.log(`Copied: ${f} -> src/pages/${f}`);
}

console.log("\nDone. src/pages/ contents:");
fs.readdirSync(pagesDir).forEach(f => console.log("  " + f));
