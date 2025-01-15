require("dotenv").config();
const axios = require("axios");
const { VALID_BLOCK_EXPLORER_HOSTS, getContractCodeUrl } = require("./config");
const fs = require("fs");
const util = require("util");
const { MESSAGES } = require("./messages");
const { ethers } = require("ethers");
const exec = util.promisify(require("child_process").exec);

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

const copyContractFromEtherscan = async (
  blockExplorer,
  address,
  challengeId
) => {
  if (!VALID_BLOCK_EXPLORER_HOSTS.includes(blockExplorer)) {
    throw new Error(`${blockExplorer} is not a valid block explorer`);
  }

  const contractName = challenges[challengeId].contractName;

  let sourceCodeParsed;
  try {
    const response = await axios.get(
      getContractCodeUrl(blockExplorer, address)
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

        sourceCodeParsed =
          validJson?.sources[`contracts/${contractName}.sol`]?.content ??
          validJson?.sources[`./contracts/${contractName}.sol`]?.content;
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

    await fs.writeFileSync(
      `${challenges[challengeId].name}/packages/hardhat/contracts/download-${address}.sol`,
      sourceCodeParsed
    );

    return true;
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    throw new Error(e);
  }
};

// Run tests for a remote {address} contract, for a {challenge} in {blockExplorer}.
const testChallenge = async ({ challenge, blockExplorer, address }) => {
  const result = {
    challenge: challenge.name,
    blockExplorer,
    address,
  };
  try {
    console.log(`🚀 Running ${challenge.name}`);

    const { stdout } = await exec(
      "cd " + challenge.name + " && CONTRACT_ADDRESS=" + address + " yarn test"
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
  exec(
    `rm -f ${challenge.name}/packages/hardhat/contracts/download-${address}.sol`
  );
  exec(
    `rm -rf ${challenge.name}/packages/hardhat/artifacts/contracts/download-${address}.sol`
  );
  exec(
    `rm -f ${challenge.name}/packages/hardhat/cache/solidity-files-cache.json`
  );

  return result;
};

const downloadAndTestContract = async (challengeId, blockExplorer, address) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error(`${address} is not a valid address.`);
  }

  if (!challenges[challengeId]) {
    throw new Error(`Challenge "${challengeId}" not found.`);
  }

  if (!VALID_BLOCK_EXPLORER_HOSTS.includes(blockExplorer)) {
    throw new Error(`"${blockExplorer}" is not a valid block explorer.`);
  }

  console.log(`📡 Downloading contract from ${blockExplorer}`);

  try {
    await copyContractFromEtherscan(blockExplorer, address, challengeId);
  } catch (e) {
    throw e;
  }

  const challenge = challenges[challengeId];

  // To avoid case sensitive conflicts.
  address = address.toLowerCase();
  return await testChallenge({ challenge, blockExplorer, address });
};

module.exports = {
  copyContractFromEtherscan,
  VALID_BLOCK_EXPLORER_HOSTS,
  downloadAndTestContract,
};
