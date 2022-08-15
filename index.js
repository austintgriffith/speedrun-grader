const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { isNetworkRunning } = require("./utils/network");
const { copyContractFromEtherscan } = require("./utils/contract");
const { allowedNetworks } = require("./utils/config");

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Run tests for a remote {address} contract, for a {challenge} in {network}.
const testChallenge = async ({ challenge, network, address }) => {
  const result = {
    challenge: challenge.name,
    network,
    address,
  };
  try {
    console.log("====] RUNNING " + challenge.name + "[==============]");

    const { stdout } = await exec(
      "cd " +
        challenge.name +
        " && CONTRACT_ADDRESS=" +
        address +
        " yarn test --network hardhat"
    );

    result.success = true;
    // Maybe we don't want this when succeeding.
    result.feedback = stdout;
  } catch (e) {
    console.error("Test failed", JSON.stringify(e));

    result.success = false;
    // ToDo. Parse this and gives a better feedback.
    result.feedback = e.stdout;
  }

  return result;
};

app.get("/", async function (req, res) {
  res.status(200).send("HELLO WORLD!");
});

app.get("/address", async function (req, res) {
  const { stdout, stderr } = await exec(
    "cd " + challenges[0].name + " && yarn account"
  );
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  res.status(200).send(stdout);
});

app.get("/network-check/:network", async function (req, res) {
  console.log("GET /network-check/:network", req.params);
  const network = req.params.network;

  if (await isNetworkRunning(network)) {
    return res.send("<pre>️" + `${network} is UP.` + "  ✔ ✔</pre>");
  } else {
    return res.send("<pre>" + `${network} is down.` + " ❌ ❌</pre>");
  }
});

// For testing purposes.
app.get("/:challengeId/:network/:address", async function (req, res) {
  console.log("GET /:challengeId/:network/:address", req.params);
  const challengeId = req.params.challengeId;
  const network = req.params.network;
  const address = req.params.address;

  if (!challenges[challengeId]) {
    // Challenge not found.
    return res.sendStatus(404);
  }

  const challenge = challenges[challengeId];

  const contractCopyResult = await copyContractFromEtherscan(
    network,
    address,
    challenge.id
  );

  if (!contractCopyResult) {
    console.error(`❌❌ Can't get the contract from ${network} in ${address}.`);
    return res.status(404).json({
      error: `Can't get the contract from ${network} in ${address}.`,
    });
  }

  const result = await testChallenge({ challenge, network, address });

  return res
    .status(200)
    .send("<html><body><pre>" + result.feedback + "</pre></body></html>");
});

// Main API endpoint.
app.post("/", async function (req, res) {
  console.log("⏩ POST", req.body);
  const challengeId = req.body.challenge;
  const network = req.body.network;
  const address = req.body.address;

  if (!challenges[challengeId]) {
    // Challenge not found.
    return res.sendStatus(404);
  }

  if (!allowedNetworks.includes(network)) {
    // Network not allowed
    return res
      .status(404)
      .json({ error: `"${network}" is not a valid testnet.` });
  }

  if (!(await isNetworkRunning(network))) {
    console.error(`❌📡❌ ${network} is down.`);
    return res.status(503).json({ error: `${network} is down.` });
  }

  console.log(`📡 ${network} is UP.`);

  const contractCopyResult = await copyContractFromEtherscan(
    network,
    address,
    challengeId
  );

  if (!contractCopyResult) {
    console.error(`❌❌ Can't get the contract from ${network} in ${address}.`);
    return res
      .status(404)
      .json({ error: `Can't get the contract from ${network} in ${address}.` });
  }

  const challenge = challenges[challengeId];
  const result = await testChallenge({ challenge, network, address });

  return res.json(result);
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(54727, () => {
      console.log("HTTPS Listening: 54727");
    });
} else {
  var server = app.listen(54727, function () {
    console.log("HTTP Listening on port:", server.address().port);
  });
}
