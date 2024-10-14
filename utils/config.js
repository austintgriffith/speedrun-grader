const VALID_BLOCK_EXPLORER_HOSTS = [
  "sepolia.etherscan.io",
  "sepolia-optimism.etherscan.io",
  "sepolia.arbiscan.io",
  "amoy.polygonscan.com",
  "sepolia.basescan.org",
];

const API_CONFIG = {
  "sepolia.etherscan.io": {
    url: "https://api-sepolia.etherscan.io/api",
    key: process.env.ETHERSCAN_API_KEY,
  },
  "sepolia-optimism.etherscan.io": {
    url: "https://api-sepolia-optimistic.etherscan.io/api",
    key: process.env.ETHERSCAN_OPTIMISTIC_API_KEY,
  },
  "sepolia.arbiscan.io": {
    url: "https://api-sepolia.arbiscan.io/api",
    key: process.env.ARBISCAN_API_KEY,
  },
  "amoy.polygonscan.com": {
    url: "https://api-amoy.polygonscan.com/api",
    key: process.env.POLYGONSCAN_API_KEY,
  },
  "sepolia.basescan.org": {
    url: "https://api-sepolia.basescan.org/api",
    key: process.env.BASESCAN_API_KEY,
  },
};

const getContractCodeUrl = (blockExplorer, address) => {
  return `${API_CONFIG[blockExplorer].url}?module=contract&action=getsourcecode&address=${address}&apikey=${API_CONFIG[blockExplorer].key}`;
};

module.exports = {
  VALID_BLOCK_EXPLORER_HOSTS,
  getContractCodeUrl,
};
