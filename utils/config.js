const allowedNetworks = ["rinkeby", "ropsten", "kovan", "goerli"];
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  allowedNetworks,
  ETHERSCAN_API_KEY,
};
