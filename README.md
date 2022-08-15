# speedrun-grader

Grade verified live contract on the hardhat network.

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


For local dev, you can run:
```
yarn server
```

now visit http://localhost:54727/

- For pretty feedback, visit: http://localhost:54727/challenge-0-simple-nft/rinkeby/0x43Ab1FCd430C1f20270C2470f857f7a006117bbb
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
