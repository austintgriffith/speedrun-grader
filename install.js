var fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const challenges = JSON.parse(fs.readFileSync("challenges.json").toString());

const setupChallenge = async (challenge) => {
  try {
    if (!fs.existsSync(`./${challenge.name}`)) {
      console.log("====] CLONING " + challenge.name + "[==============]");
      const result1 = await exec(
        "git clone -b " +
          challenge.name +
          " " +
          challenge.github +
          " " +
          challenge.name
      );
      console.log(`stdout: ${result1.stdout}\n`);
      console.log(`stderr: ${result1.stderr}\n`);
    }

    console.log("====] UPDATING " + challenge.name + "[==============]");
    const result2 = await exec(
      "cd " + challenge.name + " && git pull && yarn install"
    );
    console.log(`stdout: ${result2.stdout}\n`);
    console.log(`stderr: ${result2.stderr}\n`);
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  for (let c in challenges) {
    let challenge = challenges[c];
    console.log("challenge", challenge);
    await setupChallenge(challenge);
  }
})();
