var fs = require("fs");
const { exec } = require('child_process');

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString())

for(let c in challenges){
  let challenge = challenges[c]
  console.log("challenge",challenge)
  try{
    console.log("====] INSTALLING "+challenge.name+"[==============]")
    exec('git clone -b '+challenge.name+' '+challenge.github+' '+challenge.name, (err, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    })

    console.log("====] UPDATING "+challenge.name+"[==============]")
    exec('cd '+challenge.name+' && git pull && yarn install', (err, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    })

    console.log("====] INSTALLING "+challenge.name+" MNEMONIC[==============]")
    exec('cp mnemonic.txt '+challenge.name+'/packages/hardhat/', (err, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    })

  }catch(e){
    console.log(e)
  }
}
