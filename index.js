const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { downloadAndTestContract } = require("./utils/contract");
const { MESSAGES } = require("./utils/messages");

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// For testing purposes.
app.get("/:challengeId/:network/:address", async function (req, res) {
  console.log("GET /:challengeId/:network/:address", req.params);
  const challengeId = req.params.challengeId;
  const network = req.params.network;
  const address = req.params.address;

  let result;
  try {
    result = await downloadAndTestContract(challengeId, network, address);
  } catch (e) {
    return res.status(200).send(`
      <html>
        <body>
           <p>Can't get the contract from ${network} in ${address}.</p>
           <p>${e.message}</p>${MESSAGES.telegramHelp(challenges[challengeId])}
        </body>
      </html>
    `);
  }

  return res.status(200).send(`<html><body>${result.feedback}</body></html>`);
});

// Main API endpoint.
app.post("/", async function (req, res) {
  console.log("⏩ POST", req.body);
  const challengeId = req.body.challenge;
  const network = req.body.network;
  const address = req.body.address;

  let result;
  try {
    result = await downloadAndTestContract(challengeId, network, address);
  } catch (e) {
    return res.status(404).json({
      error: `<p>Can't get the contract from ${network} in ${address}.</p><p>${
        e.message
      }</p>${MESSAGES.telegramHelp(challenges[challengeId])}`,
    });
  }

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
