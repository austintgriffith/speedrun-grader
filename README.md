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
node install.js
```

You can rerun the install anytime to update all the test files and contracts. If you just want to download a specific challenge, you can run:

```
node install.js --challenge challenge-tokenization
# you can run node install.js --help to see all the available challenges and options
```

For local dev, you can run:

```bash
yarn server
```

now visit http://localhost:54727/

- For pretty feedback, visit: http://localhost:54727/challenge-tokenization/sepolia.etherscan.io/0xC7f0fd7ceBE69A3c4Ef28f7978bc5951064772f8
- The main API endpoint is a POST to http://localhost:54727/. E.g:

```
POST http://localhost:54727
Content-Type: application/json

{
  "challenge": "challenge-tokenization",
  "blockExplorer": "sepolia.etherscan.io",
  "address": "0xC7f0fd7ceBE69A3c4Ef28f7978bc5951064772f8"
}
```

- There's also an authenticated install endpoint. E.g:

```
POST http://localhost:54727/install
Content-Type: application/json
x-api-key: YOUR_API_KEY

{
  "challengeId": "challenge-tokenization"
}
```

On a live server, you might want to run the main script `index.js` with something like `pm2`:

```bash
pm2 start index.js --name speedrun-grader
```

## PM2 Auto-Restart

When using the `/install` endpoint to update challenges, the app will automatically restart the PM2 process to ensure the new challenge files are loaded. This can be configured with environment variables:

- `ENABLE_PM2_RESTART=true` (default) - Enable automatic PM2 restart after challenge installation
- `PM2_PROCESS_NAME=index` (default) - PM2 process name to restart. Use "all" to restart all processes, or specify a specific process name
- `PM2_RESTART_DELAY=1000` (default) - Delay in milliseconds before restarting PM2 (allows response to be sent first)

---
