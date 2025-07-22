import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
};

export default config;
