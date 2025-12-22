const challenges = {
  "challenge-tokenization": {
    name: "challenge-tokenization",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "YourCollectible",
    testName: "YourCollectible.ts",
    telegram: "https://t.me/+Y2vqXZZ_pEFhMGMx",
  },
  "challenge-crowdfunding": {
    name: "challenge-crowdfunding",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "CrowdFund",
    requiredInitialContracts: ["ExampleExternalContract.sol"],
    testName: "CrowdFund.ts",
    telegram: "https://t.me/joinchat/E6r91UFt4oMJlt01",
  },
  "challenge-token-vendor": {
    name: "challenge-token-vendor",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "Vendor",
    requiredInitialContracts: ["YourToken.sol"],
    testName: "Vendor.ts",
    telegram: "https://t.me/joinchat/IfARhZFc5bfPwpjq",
    successMessage:
      "<p>You have successfully passed the token vendor challenge!</p><p>--</p>",
  },
  "challenge-dice-game": {
    name: "challenge-dice-game",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "RiggedRoll",
    requiredInitialContracts: ["DiceGame.sol"],
    testName: "RiggedRoll.ts",
    telegram: "https://t.me/+3StA0aBSArFjNjUx",
    successMessage:
      "<p>This looks good! Demo site and contract code are solid and the dice only roll when it's a winner!</p><p>--</p>",
  },
  "challenge-dex": {
    name: "challenge-dex",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "DEX",
    requiredInitialContracts: ["Balloons.sol"],
    testName: "DEX.ts",
    telegram: "https://t.me/+_NeUIJ664Tc1MzIx",
    successMessage:
      "<p>You have successfully passed the Dex Challenge! Great work!</p><p>--</p>",
  },
  "challenge-over-collateralized-lending": {
    name: "challenge-over-collateralized-lending",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "Lending",
    requiredInitialContracts: ["Corn.sol", "CornDEX.sol"],
    testName: "Lending.ts",
    telegram: "https://t.me/+xQr5d-oVhLMwZmUx",
    successMessage:
      "<p>You have successfully passed the Over-collateralized Lending Challenge! Great work!</p><p>--</p>",
  },
  "challenge-prediction-markets": {
    name: "challenge-prediction-markets",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "PredictionMarket",
    requiredInitialContracts: ["PredictionMarketToken.sol"],
    testName: "PredictionMarket.ts",
    telegram: "https://t.me/+NY00cDZ7PdBmNWEy",
    successMessage:
      "<p>You have successfully passed the Prediction Markets Challenge! Great work!</p><p>--</p>",
  },
  "challenge-stablecoins": {
    name: "challenge-stablecoins",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "MyUSDEngine",
    requiredInitialContracts: [
      "MyUSD.sol",
      "DEX.sol",
      "MyUSDStaking.sol",
      "Oracle.sol",
      "RateController.sol",
    ],
    testName: "MyUSDEngine.ts",
    telegram: "https://t.me/+y93US5WbP5dkNDFh",
    successMessage:
      "<p>You have successfully passed the Stablecoins Challenge! Great work!</p><p>--</p>",
  },
  "challenge-zk-voting": {
    name: "challenge-zk-voting",
    github: "https://github.com/scaffold-eth/se-2-challenges.git",
    contractName: "Voting",
    testName: "Voting.ts",
    telegram: "https://t.me/+dkPzMUauQpY5N2My",
    requiredInitialContracts: ["mocks/VerifierMock.sol", "Verifier.sol"],
    successMessage:
      "<p>You have successfully passed the ZK Voting Challenge! Great work!</p><p>--</p>",
  },
};

module.exports = challenges;
