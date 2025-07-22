# speedrun-grader

---

### TODO:

- [ ] Openzepplin version on simple-nft challenge (it's the only one)
- [ ] YourTokenAutograder.sol / YourToken.sol should be the same? As dex?
- [x] stablecoins challenge: fetch price for uniswap not needed?? use 2600n \* 10n \*\* 18n
- [ ] Update README

---

Grade verified live contracts on the hardhat network.

```
git clone https://github.com/austintgriffith/speedrun-grader
cd speedrun-grader
yarn install
```

Copy `.env.example` to `.env` and put in your [Etherscan API Key](https://etherscan.io/apis).

To download all the challenges specified on `challenges.json`, run:

```
yarn install-challenges <create-eth version>
```

The `create-eth version` parameter is optional and should only be used for development purposes. If omitted, the latest stable create-eth version for extensions will be used.

You can rerun the install anytime to update all the repos.

**Note**: For challenge 2, you have to manually create a `YourTokenAutograder.sol` file inside `challenge-2-token-vendor/packages/hardhat/contracts`

```solidity
pragma solidity 0.8.20; // Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourToken is ERC20 {
    constructor() ERC20("Gold", "GLD") {
        _mint( msg.sender, 1000 * 10 ** 18);
    }
}

```

---

For local dev, you can run:

```bash
yarn server
```

now visit http://localhost:54727/

- For pretty feedback, visit: http://localhost:54727/0/sepolia.etherscan.io/0x6976571037372EeDF61Ca174b0eca4f6995d9d04
- The main API endpoint is a POST to http://localhost:54727/. E.g:

```
POST http://localhost:54727
Content-Type: application/json

{
  "challenge": 0,
  "blockExplorer": "sepolia.etherscan.io",
  "address": "0x6976571037372EeDF61Ca174b0eca4f6995d9d04"
}
```

On a live server, you might want to run the main script `index.js` with something like `pm2`

---
