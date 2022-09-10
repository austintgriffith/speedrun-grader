require("dotenv").config();
const axios = require("axios");
const { allowedNetworks, ETHERSCAN_API_KEY } = require("./config");
const fs = require("fs");
const util = require("util");
const { MESSAGES } = require("./messages");
const exec = util.promisify(require("child_process").exec);

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

const copyContractFromEtherscan = async (network, address, challengeId) => {
  if (!allowedNetworks.includes(network)) {
    throw new Error(`${network} is not a valid testnet`);
  }

  const API_URL = `https://api-${network}.etherscan.io/api`;
  const paramString = `?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`;
  const contractName = challenges[challengeId].contractName;

  let sourceCodeParsed;
  try {
    const response = await axios.get(API_URL + paramString);
    // The Etherscan API returns OK / NOTOK
    if (response.data.message !== "OK") {
      return false;
    }

    // On "sourceCode" Etherscan return two possible values:
    // 1. A string (on flattened contracts)
    // 2. An almost-valid JSON :( (on splitted verified contracts)
    const sourceCode = response?.data?.result?.[0]?.SourceCode;
    if (!sourceCode) {
      throw new Error(
        "Contract Source Code is not valid. Is the Contract verified?"
      );
    }

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

    if (!sourceCodeParsed) {
      throw new Error(
        `Contract Source Code is not valid. Are you submitting ${contractName}.sol Contract Address?`
      );
    }

    await fs.writeFileSync(
      `${challenges[challengeId].name}/packages/hardhat/contracts/${address}.sol`,
      sourceCodeParsed
    );

    return true;
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    throw new Error(e);
  }
};

// Run tests for a remote {address} contract, for a {challenge} in {network}.
const testChallenge = async ({ challenge, network, address }) => {
  const result = {
    challenge: challenge.name,
    network,
    address,
  };
  try {
    console.log("====] RUNNING " + challenge.name + "[==============]");

    const { stdout } = await exec(
      "cd " +
        challenge.name +
        " && CONTRACT_ADDRESS=" +
        address +
        " yarn test --network hardhat"
    );

    console.log("Tests passed successfully!\n");
    result.success = true;
    // Maybe we don't want this when succeeding.
    result.feedback = `${MESSAGES.successTest(challenge)}<pre>${stdout}</pre>`;
  } catch (e) {
    console.error("Test failed", JSON.stringify(e), "\n");

    result.success = false;
    // ToDo. Parse this and gives a better feedback.
    result.feedback = `${MESSAGES.failedTest(challenge)}<pre>${e.stdout}\n\n${
      e.stderr
    }</pre>`;
  }

  // Delete files. Don't need to await.
  exec(`rm ${challenge.name}/packages/hardhat/contracts/${address}.sol`);

  return result;
};

const downloadAndTestContract = async (challengeId, network, address) => {
  if (!challenges[challengeId]) {
    throw new Error(`Challenge "${challengeId}" not found.`);
  }

  if (!allowedNetworks.includes(network)) {
    throw new Error(`"${network}" is not a valid testnet.`);
  }

  console.log(`📡 Downloading contract from ${network}`);

  try {
    await copyContractFromEtherscan(network, address, challengeId);
  } catch (e) {
    throw e;
  }

  const challenge = challenges[challengeId];
  return await testChallenge({ challenge, network, address });
};

module.exports = {
  copyContractFromEtherscan,
  allowedNetworks,
  downloadAndTestContract,
};
