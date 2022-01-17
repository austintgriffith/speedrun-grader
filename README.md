# speedrun-grader


```
git clone https://github.com/austintgriffith/speedrun-grader
cd speedrun-grader
yarn install
```

Copy `.env.example` to `.env` and put in your [Etherscan API Key](https://etherscan.io/apis).

You also need a 12 word seed phrase as a deployer in a file called `mnemonic.txt`

(you could use this eth.build to create one: https://eth.build/build#6f1ab054a3e274128914fdfd3e0e0868245816059ee4cb0b2a4f608e57bddea8)


with `mnemonic.txt` in place, run:

```
node install
```

this will take some time and pull down the challenges and install your mnemonic...


you can rerun the install anytime to update all the repos...

```
node install
```



fire up the local webserver:

```
node index.js
```


now visit http://localhost:54727/

for pretty feedback, visit:http://localhost:54727/pretty/challenge-0-simple-nft/rinkeby/0x43Ab1FCd430C1f20270C2470f857f7a006117bbb


the api will call: http://localhost:54727/challenge-0-simple-nft/rinkeby/0x43Ab1FCd430C1f20270C2470f857f7a006117bbb


you will probably get "Error: insufficient funds for intrinsic transaction cost" (make sure you fund your deployer account for different testnets)

fund your ` 🧑‍🏫 Tester Address` with https://faucet.paradigm.xyz/
