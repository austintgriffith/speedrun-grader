var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();

let transactions = {}

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    console.log("/")
    res.status(200).send("hello world");
});

/*
app.get("/:key", function(req, res) {
    let key = req.params.key
    console.log("/",key)
    res.status(200).send(transactions[key]);
});
*/

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
