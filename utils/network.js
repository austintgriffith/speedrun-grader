require("dotenv").config();
const axios = require("axios");

const allowedNetworks = ["rinkeby", "ropsten", "kovan", "goerli"];
const API_KEY = process.env.ETHERSCAN_API_KEY;

/**
 * Checks if "network" is up.
 * @param network a supported Ethereum network
 * @returns {Promise<boolean>}
 */
const isNetworkRunning = async (network) => {
  if (!allowedNetworks.includes(network)) return false;

  const API_URL = `https://api-${network}.etherscan.io/api`;
  const currentTimestamp = Math.round(Date.now() / 1000);
  // We assume the network is Down that if not valid block in the last 2 minutes
  const aliveFromTimestamp = currentTimestamp - 120;

  const paramString = `?module=block&action=getblocknobytime&timestamp=${aliveFromTimestamp}&closest=after&apikey=${API_KEY}`;

  try {
    const response = await axios.get(API_URL + paramString);
    // The Etherscan API returns OK / NOTOK
    return response.data.message === "OK";
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    return false;
  }
};

const fetchContractFromEtherscan = async (network, address, contractName) => {
  if (!allowedNetworks.includes(network)) return false;

  const API_URL = `https://api-${network}.etherscan.io/api`;
  const paramString = `?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`;

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

    let sourceCodeParsed;
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

    return sourceCodeParsed ?? false;
  } catch (e) {
    // Issue with the Request.
    console.error(e);
    return false;
  }
};

module.exports = {
  isNetworkRunning,
  fetchContractFromEtherscan,
  allowedNetworks,
};
