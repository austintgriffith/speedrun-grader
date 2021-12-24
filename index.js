var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();

let challenges = JSON.parse(fs.readFileSync("challenges.json").toString())

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { exec } = require('child_process');

app.get("/address", function(req, res) {

  exec('cd '+challenges[0].name+' && yarn account', (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    res.status(200).send(stdout);
  })

});

app.get("/:challenge/:network/:address", function(req, res) {
    console.log("/:challenge/:network/:address",req.params)

    for(let c in challenges){
      if(challenges[c].name === req.params.challenge){
        let challenge = challenges[c];
        console.log("====] RUNNING "+challenge.name+"[==============]")
        exec('cd '+challenge.name+' && CONTRACT_ADDRESS='+req.params.address+' yarn test --network '+req.params.network+' && echo "CHALLENGE_SUCCESS" || echo "CHALLENGE_FAILED"', (err, stdout, stderr) => {
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);

          res.status(200).send("<html><body><pre>"+stdout+"</pre></body></html>");
        })
      }
    }

});





app.post('/', function(request, response){
    console.log("POOOOST!!!!",request.body);      // your JSON




    response.send({
      challenge: request.body.challenge,
      network: request.body.network,
      contract: request.body.contract,
      success: false,
      feedback: "everything fails right now so you will always see this but eventually this will just be feedback for when something went wrong"
    });    // echo the result back
    console.log("request.body",request.body)
});


if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(54727, () => {
    console.log('HTTPS Listening: 54727')
  })
}else{
  var server = app.listen(54727, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}
