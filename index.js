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
require("dotenv").config();

const challenges = require("./challenges");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Key authentication middleware
function authenticateApiKey(req, res, next) {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      error:
        "Server configuration error: API_KEY not set in environment variables",
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: "Unauthorized: Invalid or missing API key",
    });
  }

  next();
}

app.get("/", async function (req, res) {
  res.status(200).send("HELLO WORLD!");
});

// For testing purposes.
app.get("/:challengeId/:blockExplorer/:address", async function (req, res) {
  console.log("GET /:challengeId/:blockExplorer/:address", req.params);
  const challengeId = req.params.challengeId;
  const blockExplorer = req.params.blockExplorer;
  // To avoid case-sensitive conflicts.
  const address = req.params.address.toLowerCase();

  let result;
  try {
    result = await downloadAndTestContract(challengeId, blockExplorer, address);
  } catch (e) {
    return res.status(200).send(`
      <html>
        <body>
           <p>Can't get the contract from ${blockExplorer} in ${address}.</p>
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
  const blockExplorer = req.body.blockExplorer;
  // To avoid case-sensitive conflicts.
  const address = req.body.address.toLowerCase();

  let result;
  try {
    result = await downloadAndTestContract(challengeId, blockExplorer, address);
  } catch (e) {
    return res.status(404).json({
      error: `<p>Can't get the contract from ${blockExplorer} in ${address}.</p><p>${
        e.message
      }</p>${MESSAGES.telegramHelp(challenges[challengeId])}`,
    });
  }

  return res.json(result);
});

// Install/Update challenge endpoint with API key authentication
app.post("/install", authenticateApiKey, async function (req, res) {
  console.log("⚙️ POST /install", req.body);
  const { challengeId } = req.body;

  if (!challengeId) {
    return res.status(400).json({
      error: "Missing required parameter: challengeId",
      availableChallenges: Object.keys(challenges),
    });
  }

  if (!challenges[challengeId]) {
    return res.status(400).json({
      error: `Invalid challengeId: ${challengeId}`,
      availableChallenges: Object.keys(challenges),
    });
  }

  try {
    console.log(`🔄 Installing/updating challenge: ${challengeId}`);

    // Execute the install command with force flag to avoid interactive prompts
    const command = `node install.js --challenge ${challengeId} --force`;
    const { stdout } = await exec(command, {
      cwd: __dirname,
      timeout: 120000, // 2 minutes timeout
    });

    console.log(`✅ Install completed for ${challengeId}`);

    return res.json({
      success: true,
      message: `Successfully installed/updated challenge: ${challengeId}`,
      challengeId,
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Install failed for ${challengeId}:`, error.message);

    return res.status(500).json({
      success: false,
      error: `Failed to install/update challenge: ${challengeId}`,
      details: error.message,
      challengeId,
      timestamp: new Date().toISOString(),
    });
  }
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
