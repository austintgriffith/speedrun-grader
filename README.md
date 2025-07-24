# speedrun-grader

Grade verified live contracts on the hardhat network.

```
git clone https://github.com/austintgriffith/speedrun-grader
cd speedrun-grader
yarn install
```

Copy `.env.example` to `.env` and put in your [Etherscan API Key](https://etherscan.io/apis).

To download all the test files and contracts for the challenges specified on `challenges.ts`, run:

```
yarn install-challenges
```

You can rerun the install anytime to update all the test files and contracts.

For local dev, you can run:

```bash
yarn server
```

now visit http://localhost:54727/

- For pretty feedback, visit: http://localhost:54727/challenge-simple-nft/sepolia.etherscan.io/0xC7f0fd7ceBE69A3c4Ef28f7978bc5951064772f8
- The main API endpoint is a POST to http://localhost:54727/. E.g:

```
POST http://localhost:54727
Content-Type: application/json

{
  "challenge": "challenge-simple-nft",
  "blockExplorer": "sepolia.etherscan.io",
  "address": "0xC7f0fd7ceBE69A3c4Ef28f7978bc5951064772f8"
}
```

On a live server, you might want to run the main script `index.js` with something like `pm2`

---
