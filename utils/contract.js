require("dotenv").config();
const axios = require("axios");
const { allowedNetworks, ETHERSCAN_API_KEY } = require("./config");
const fs = require("fs");

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

const copyContractFromEtherscan = async (network, address, challengeId) => {
  if (!allowedNetworks.includes(network)) return false;

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
    if (!sourceCode) return false;

    if (sourceCode.slice(0, 1) === "{") {
      // Option 2. An almost valid JSON
      // Remove the initial and final { }
      const validJson = JSON.parse(sourceCode.substring(1).slice(0, -1));
      sourceCodeParsed =
        validJson?.sources[`contracts/${contractName}.sol`]?.content;
    } else {
      // Option 1. A string
      sourceCodeParsed = sourceCode;
    }

    if (!sourceCodeParsed) return false;

    await fs.writeFileSync(
      `${challenges[challengeId].name}/packages/hardhat/contracts/${address}.sol`,
      sourceCodeParsed
    );

    return true;
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    return false;
  }
};

module.exports = {
  copyContractFromEtherscan,
  allowedNetworks,
};
