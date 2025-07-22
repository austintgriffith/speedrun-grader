const fs = require("fs");
const path = require("path");
const challenges = require("./challenges.js");

// Ensure hardhat/test directory exists
const testDir = path.join(__dirname, "hardhat", "test");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Function to download a file from a URL
async function downloadFile(url, destinationPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`
    );
  }

  const content = await response.text();
  fs.writeFileSync(destinationPath, content);
}

// Function to convert GitHub repo URL to raw URL format
function getGitHubRawUrl(repoUrl, filePath, branchName) {
  // Convert from https://github.com/owner/repo.git to https://raw.githubusercontent.com/owner/repo/branchName/
  const match = repoUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  if (!match) {
    throw new Error(`Invalid GitHub URL format: ${repoUrl}`);
  }

  const [, owner, repo] = match;
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branchName}/${filePath}`;
}

// Main function to download all test files
async function downloadAllTestFiles() {
  console.log("Starting download of test files...\n");

  const challengeEntries = Object.entries(challenges);
  let successCount = 0;
  let failCount = 0;

  for (const [challengeId, challengeData] of challengeEntries) {
    try {
      console.log(`Downloading test for ${challengeId}...`);

      // Construct the file path in the repo
      const repoFilePath = `extension/packages/hardhat/test/${challengeData.testName}`;

      // Get the raw GitHub URL
      const downloadUrl = getGitHubRawUrl(
        challengeData.github,
        repoFilePath,
        challengeData.name
      );

      // Destination file path
      const destinationPath = path.join(testDir, `${challengeId}.ts`);

      console.log(`  From: ${downloadUrl}`);
      console.log(`  To: ${destinationPath}`);

      // Download the file
      await downloadFile(downloadUrl, destinationPath);

      console.log(`  ✅ Successfully downloaded ${challengeId}\n`);
      successCount++;
    } catch (error) {
      console.error(
        `  ❌ Failed to download ${challengeId}: ${error.message}\n`
      );
      failCount++;
    }
  }

  console.log("Download complete!");
  console.log(`Successfully downloaded: ${successCount} files`);
  console.log(`Failed downloads: ${failCount} files`);
}

// Run the script
downloadAllTestFiles().catch(console.error);
