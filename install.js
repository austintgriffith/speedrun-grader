var fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

const CREATE_ETH_STABLE_VERSION_FOR_CHALLENGES = "0.1.0";
const createEthVersion =
  process.argv[2] || CREATE_ETH_STABLE_VERSION_FOR_CHALLENGES;

const setupChallenge = async (challenge) => {
  try {
    const tempFolder = `${challenge.name}_temp`;

    if (fs.existsSync(tempFolder)) {
      console.log(`🗑  Removing old temporary folder of ${challenge.name}`);
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }

    console.log(`📦 Installing ${challenge.name} to temporary folder`);
    const result1 = await exec(
      `npx --yes create-eth@${createEthVersion} -s hardhat -e scaffold-eth/se-2-challenges:${challenge.name} ${tempFolder}`
    );
    // console.log(`stdout: ${result1.stdout}\n`);

    if (result1.stderr) {
      console.log(`stderr: ${result1.stderr}\n`);
    }

    // If installation was successful, swap the folders
    if (fs.existsSync(tempFolder)) {
      if (fs.existsSync(`./${challenge.name}`)) {
        console.log(`🗑  Removing old ${challenge.name} folder`);
        fs.rmSync(`./${challenge.name}`, { recursive: true, force: true });
      }

      console.log(`📂 Moving new installation to final location`);
      fs.renameSync(tempFolder, `./${challenge.name}`);
    }
  } catch (e) {
    console.log(`❌ Error installing ${challenge.name}:`, e);
    // Clean up temp folder if it exists
    if (fs.existsSync(`./${challenge.name}_temp`)) {
      fs.rmSync(`./${challenge.name}_temp`, { recursive: true, force: true });
    }
  }
};

(async () => {
  for (let c in challenges) {
    let challenge = challenges[c];
    console.log(
      `\n📋 Processing challenge ${c}/${Object.keys(challenges).length}:`
    );

    console.log(`🔍 Challenge ${c} details:`, challenge);

    // Skip if challenge folder already exists
    if (fs.existsSync(`./${challenge.name}`)) {
      console.log(`📁 Challenge ${c} folder already exists, skipping`);
      continue;
    }

    await setupChallenge(challenge);
    console.log(`✅ Challenge ${c} installation completed`);
  }
  console.log("✨ All challenge installations completed!");
})();
