require("dotenv").config();
const axios = require("axios");
const { allowedNetworks, ETHERSCAN_API_KEY } = require("./config");

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

  const paramString = `?module=block&action=getblocknobytime&timestamp=${aliveFromTimestamp}&closest=after&apikey=${ETHERSCAN_API_KEY}`;

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

module.exports = {
  isNetworkRunning,
};
