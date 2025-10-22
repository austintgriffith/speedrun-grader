const fs = require("fs");
const path = require("path");
const readline = require("readline");
const challenges = require("./challenges.js");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask user for confirmation
function askConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--challenge" && i + 1 < args.length) {
      options.challenge = args[i + 1];
      i++; // Skip the next argument since it's the value
    } else if (args[i] === "--help" || args[i] === "-h") {
      showHelp();
      process.exit(0);
    } else if (args[i] === "--force" || args[i] === "-f") {
      options.force = true;
    }
  }

  return options;
}

function showHelp() {
  console.log("SpeedRun Grader Install Script");
  console.log("==============================");
  console.log("");
  console.log("Usage: node install.js [options]");
  console.log("");
  console.log("Options:");
  console.log(
    "  --challenge <challengeId>  Download files for a specific challenge only"
  );
  console.log(
    "  --force, -f                Skip confirmation prompts and overwrite existing files"
  );
  console.log("  --help, -h                 Show this help message");
  console.log("");
  console.log("Available challenges:");
  Object.keys(challenges).forEach((challengeId) => {
    console.log(`  - ${challengeId}`);
  });
}

function getFilteredChallenges(options) {
  if (options.challenge) {
    if (!challenges[options.challenge]) {
      console.error(`❌ Error: Challenge '${options.challenge}' not found.`);
      console.log("\nAvailable challenges:");
      Object.keys(challenges).forEach((challengeId) => {
        console.log(`  - ${challengeId}`);
      });
      process.exit(1);
    }

    console.log(`📦 Installing files for challenge: ${options.challenge}\n`);
    return { [options.challenge]: challenges[options.challenge] };
  }

  console.log("📦 Installing files for all challenges...\n");
  return challenges;
}

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

  // Ensure the destination directory exists
  const destinationDir = path.dirname(destinationPath);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

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
async function downloadAllTestFiles(options = {}) {
  const filteredChallenges = getFilteredChallenges(options);

  const challengeEntries = Object.entries(filteredChallenges);
  let testSuccessCount = 0;
  let testFailCount = 0;
  let contractSuccessCount = 0;
  let contractFailCount = 0;
  let testSkippedCount = 0;
  let contractSkippedCount = 0;

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

      // Check if file exists and ask for confirmation if needed
      if (fs.existsSync(destinationPath) && !options.force) {
        const shouldOverwrite = await askConfirmation(
          `\t⚠️  File ${challengeId}.ts already exists. Overwrite?`
        );
        if (!shouldOverwrite) {
          console.log(`\t⏭️  Skipped ${challengeId} test file\n`);
          testSkippedCount++;
        } else {
          // Download the file
          await downloadFile(downloadUrl, destinationPath);
          console.log(`\t✅ Successfully downloaded test ${challengeId}\n`);
          testSuccessCount++;
        }
      } else {
        // Download the file
        await downloadFile(downloadUrl, destinationPath);
        console.log(`\t✅ Successfully downloaded test ${challengeId}\n`);
        testSuccessCount++;
      }
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

          // Check if contract file exists and ask for confirmation if needed
          if (fs.existsSync(contractDestinationPath) && !options.force) {
            const shouldOverwrite = await askConfirmation(
              `\t⚠️  Contract ${contractFile} already exists. Overwrite?`
            );
            if (!shouldOverwrite) {
              console.log(`\t⏭️  Skipped contract ${contractFile}\n`);
              contractSkippedCount++;
              continue;
            }
          }

          // Download the contract file
          await downloadFile(contractDownloadUrl, contractDestinationPath);
          console.log(
            `\t✅ Successfully downloaded contract ${contractFile}\n`
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
  }

  // Close readline interface
  rl.close();

  console.log("Download complete!");
  console.log(`Successfully downloaded: ${testSuccessCount} test files`);
  console.log(`Failed test downloads: ${testFailCount} files`);
  if (testSkippedCount > 0) {
    console.log(`Skipped test files: ${testSkippedCount} files`);
  }
  console.log(
    `Successfully downloaded: ${contractSuccessCount} contract files`
  );
  console.log(`Failed contract downloads: ${contractFailCount} files`);
  if (contractSkippedCount > 0) {
    console.log(`Skipped contract files: ${contractSkippedCount} files`);
  }
}

// Run the script
const options = parseArgs();
downloadAllTestFiles(options).catch(console.error);
