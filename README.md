# speedrun-grader

Grade verified live contracts on the hardhat network.

```
git clone https://github.com/austintgriffith/speedrun-grader
cd speedrun-grader
yarn install
```

Copy `.env.example` to `.env` and put in your [Etherscan API Key](https://etherscan.io/apis).

To download all the challenges (specified on challenges.json), run:
```
node install
```

You can rerun the install anytime to update all the repos.

**Note**: For challenge 2, you have to manually create a `YourTokenAutograder.sol` file inside `challenge-2-token-vendor/packages/hardhat/contracts`

```solidity
pragma solidity 0.8.4;
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
```
yarn server
```

now visit http://localhost:54727/

- For pretty feedback, visit: http://localhost:54727/0/rinkeby/0x43Ab1FCd430C1f20270C2470f857f7a006117bbb
- The main API endpoint is a POST to http://localhost:54727/. E.g:
```
POST http://localhost:54727
Content-Type: application/json

{
  "challenge": 0,
  "network": "rinkeby",
  "address": "0x43Ab1FCd430C1f20270C2470f857f7a006117bbb"
}
```

On a live server, you might want to run the main script `index.js` with something like `pm2`
