import fs from "fs";
import path from "path";

console.log("🔍 Build Verification Script");
console.log("Current working directory:", process.cwd());
console.log("Script location:", import.meta.url);

const checkPath = (pathToCheck, description) => {
  console.log(`\n📁 Checking ${description}: ${pathToCheck}`);

  if (fs.existsSync(pathToCheck)) {
    console.log("✅ Exists");
    try {
      const stats = fs.statSync(pathToCheck);
      if (stats.isDirectory()) {
        const contents = fs.readdirSync(pathToCheck);
        console.log(
          `📂 Contents (${contents.length} items):`,
          contents.slice(0, 10).join(", ")
        );
        if (contents.length > 10)
          console.log(`... and ${contents.length - 10} more`);
      } else {
        console.log("📄 File size:", stats.size, "bytes");
      }
    } catch (e) {
      console.log("❌ Cannot read:", e.message);
    }
  } else {
    console.log("❌ Does not exist");
  }
};

// Check current directory
checkPath(".", "Current directory");
checkPath("./frontend", "Frontend directory");
checkPath("./frontend/dist", "Frontend dist directory");
checkPath("./frontend/dist/index.html", "Frontend index.html");

// Check parent directory
checkPath("..", "Parent directory");
checkPath("../frontend", "Parent/Frontend directory");
checkPath("../frontend/dist", "Parent/Frontend dist directory");

console.log("\n🏁 Build verification complete");
