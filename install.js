const fs = require("fs");
const path = require("path");
const challenges = require("./challenges.js");

// Ensure hardhat/test directory exists
const testDir = path.join(__dirname, "hardhat", "test");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Ensure hardhat/contracts directory exists
const contractsDir = path.join(__dirname, "hardhat", "contracts");
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
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

// Main function to download all test files and contracts
async function downloadAllTestFiles() {
  console.log("Starting download of test files and contracts...\n");

  const challengeEntries = Object.entries(challenges);
  let testSuccessCount = 0;
  let testFailCount = 0;
  let contractSuccessCount = 0;
  let contractFailCount = 0;

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

      console.log(`\tFrom: ${downloadUrl}`);
      console.log(`\tTo: ${destinationPath}`);

      // Download the file
      await downloadFile(downloadUrl, destinationPath);

      console.log(`\t✅ Successfully downloaded test ${challengeId}\n\n`);
      testSuccessCount++;
    } catch (error) {
      console.error(
        `\t❌ Failed to download test ${challengeId}: ${error.message}`
      );
      testFailCount++;
    }

    // Download required initial contracts if they exist
    if (challengeData.requiredInitialContracts?.length > 0) {
      console.log(`\tDownloading required contracts for ${challengeId}...`);

      for (const contractFile of challengeData.requiredInitialContracts) {
        try {
          // Construct the contract file path in the repo
          const contractRepoFilePath = `extension/packages/hardhat/contracts/${contractFile}`;

          // Get the raw GitHub URL for the contract
          const contractDownloadUrl = getGitHubRawUrl(
            challengeData.github,
            contractRepoFilePath,
            challengeData.name
          );

          // Destination file path for the contract
          const contractDestinationPath = path.join(contractsDir, contractFile);

          console.log(`\tContract From: ${contractDownloadUrl}`);
          console.log(`\tContract To: ${contractDestinationPath}`);

          // Download the contract file
          await downloadFile(contractDownloadUrl, contractDestinationPath);

          console.log(
            `\t✅ Successfully downloaded contract ${contractFile}\n\n`
          );
          contractSuccessCount++;
        } catch (error) {
          console.error(
            `\t❌ Failed to download contract ${contractFile}: ${error.message}`
          );
          contractFailCount++;
        }
      }
    }

    console.log(""); // Add spacing between challenges
  }

  console.log("Download complete!");
  console.log(`Successfully downloaded: ${testSuccessCount} test files`);
  console.log(`Failed test downloads: ${testFailCount} files`);
  console.log(
    `Successfully downloaded: ${contractSuccessCount} contract files`
  );
  console.log(`Failed contract downloads: ${contractFailCount} files`);
}

// Run the script
downloadAllTestFiles().catch(console.error);
