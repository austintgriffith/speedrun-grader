require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const util = require("util");
const { MESSAGES } = require("./messages");
const { ethers } = require("ethers");
const { SUPPORTED_CHAINS } = require("./supported-chains");
const exec = util.promisify(require("child_process").exec);

const challenges = require("../challenges");

const getContractCodeUrl = (chainId, address) => {
  return `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;
};

const copyContractFromEtherscan = async (
  blockExplorer,
  address,
  challengeId
) => {
  const chain = SUPPORTED_CHAINS.find((chain) =>
    chain.blockexplorer.includes(blockExplorer)
  );

  if (!chain) {
    throw new Error(`${blockExplorer} is not a supported block explorer`);
  }

  const contractName = challenges[challengeId].contractName;

  let sourceCodeParsed;
  let contractPath = null;
  try {
    const response = await axios.get(
      getContractCodeUrl(chain.chainid, address)
    );
    // The Etherscan API returns OK / NOTOK
    if (response.data.message !== "OK") {
      return false;
    }

    // On "sourceCode" Etherscan return 3 possible values:
    // 1. A string (on flattened contracts)
    // 2. An almost-valid JSON :( (on splitted verified contracts)
    // 3. A valid JSON (on _some_ splitted verified contracts). Damn boi.
    const sourceCode = response?.data?.result?.[0]?.SourceCode;
    if (!sourceCode) {
      throw new Error(
        "Contract Source Code is not valid. Is the Contract verified?"
      );
    }

    try {
      // Option 3. A valid JSON
      const parsedJson = JSON.parse(sourceCode);
      sourceCodeParsed = parsedJson?.[`${contractName}.sol`]?.content;
    } catch (e) {
      if (sourceCode.slice(0, 1) === "{") {
        // Option 2. An almost valid JSON
        // Remove the initial and final { }
        const validJson = JSON.parse(sourceCode.substring(1).slice(0, -1));

        // Try multiple possible paths for the contract
        sourceCodeParsed =
          validJson?.sources[`contracts/${contractName}.sol`]?.content ??
          validJson?.sources[`./contracts/${contractName}.sol`]?.content;

        // If not found in standard paths, search through all sources for the contract
        if (!sourceCodeParsed && validJson?.sources) {
          for (const [path, source] of Object.entries(validJson.sources)) {
            if (path.endsWith(`${contractName}.sol`)) {
              sourceCodeParsed = source.content;
              contractPath = path;
              console.log(`Found contract at path: ${path}`);
              break;
            }
          }
        }
      } else {
        // Option 1. A string
        sourceCodeParsed = sourceCode;
      }
    }

    if (!sourceCodeParsed) {
      throw new Error(
        `Contract Source Code is not valid. Are you submitting ${contractName}.sol Contract Address?`
      );
    }

    // Determine the file path to write to
    let filePath = `hardhat/contracts/download-${address}.sol`;

    // If contractPath is found and it's not just in /contracts/, preserve the directory structure
    if (contractPath && !contractPath.match(/^\.?\/?contracts\/[^\/]+\.sol$/)) {
      // Extract the path relative to contracts/
      const pathMatch = contractPath.match(/contracts\/(.+)/);
      if (pathMatch) {
        const relativePath = pathMatch[1];
        filePath = `hardhat/contracts/${relativePath.replace(
          `${contractName}.sol`,
          `download-${address}.sol`
        )}`;

        // Create the directory structure if it doesn't exist
        const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    }

    await fs.writeFileSync(filePath, sourceCodeParsed);

    return filePath;
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    throw new Error(e);
  }
};

// Run tests for a remote {address} contract, for a {challenge} in {blockExplorer}.
const testChallenge = async ({
  challenge,
  blockExplorer,
  address,
  filePath,
}) => {
  const result = {
    challenge: challenge.name,
    blockExplorer,
    address,
  };
  try {
    console.log(`🚀 Running ${challenge.name}`);

    const { stdout } = await exec(
      `CONTRACT_ADDRESS=${address} yarn test test/${challenge.name}`
    );

    console.log("✅ Tests passed successfully!\n");
    result.success = true;
    // Maybe we don't want this when succeeding.
    result.feedback = `${MESSAGES.successTest(challenge)}<pre>${stdout}</pre>`;
  } catch (e) {
    console.error("❌ Test failed", JSON.stringify(e), "\n");

    result.success = false;
    // ToDo. Parse this and gives a better feedback.
    result.feedback = `${MESSAGES.failedTest(challenge)}<pre>${e.stdout}\n\n${
      e.stderr
    }</pre>`;
  }

  // Delete files. Don't need to await.
  exec(`rm -f ${filePath}`);
  exec(`rm -rf hardhat/artifacts/${filePath.replace("hardhat/", "")}`);
  exec(`rm -f hardhat/cache/solidity-files-cache.json`);

  return result;
};

const downloadAndTestContract = async (challengeId, blockExplorer, address) => {
  if (!ethers.isAddress(address)) {
    throw new Error(`${address} is not a valid address.`);
  }

  if (!challenges[challengeId]) {
    throw new Error(`Challenge "${challengeId}" not found.`);
  }

  console.log(`📡 Downloading contract from ${blockExplorer}`);
  let filePath;
  try {
    filePath = await copyContractFromEtherscan(
      blockExplorer,
      address,
      challengeId
    );
  } catch (e) {
    throw e;
  }

  const challenge = challenges[challengeId];

  // To avoid case sensitive conflicts.
  address = address.toLowerCase();
  return await testChallenge({ challenge, blockExplorer, address, filePath });
};

module.exports = {
  copyContractFromEtherscan,
  downloadAndTestContract,
};
