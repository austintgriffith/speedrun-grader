const VALID_BLOCK_EXPLORER_HOSTS = [
  "sepolia.etherscan.io",
  "sepolia-optimism.etherscan.io",
];

const BLOCK_EXPLORER_TO_CHAIN_ID = {
  "sepolia.etherscan.io": 11155111,
  "sepolia-optimism.etherscan.io": 11155420,
};

const getContractCodeUrl = (blockExplorer, address) => {
  return `https://api.etherscan.io/v2/api?chainid=${BLOCK_EXPLORER_TO_CHAIN_ID[blockExplorer]}&module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;
};

module.exports = {
  VALID_BLOCK_EXPLORER_HOSTS,
  getContractCodeUrl,
};
