const path = require('path');
const express = require('express');
const Gun = require('gun');
//const SEA = require("gun/sea");
var {Radix} = require('gun/lib/radix');
var {Radisk} = require('gun/lib/radisk');
var Store = require('gun/lib/store');
var {RindexedDB} = require('gun/lib/rindexed');
var {zenbase} = require('zenbase');

const port = (process.env.PORT || 8765);
const host = '0.0.0.0';

var skySecret = "YOUR_SKY_SECRET_HERE"; 
var skyPortal = "https://siasky.net";
var skyDebug = true;
var skyUntil = 2*1000; 
var skyRadisk = true;
var skyRadata = "radata";

const app = express();
app.use(zenbase.serve);

const server = app.listen(port, host);

console.log(`server listening on http://${host}:${port}`);

function logIn(msg){
  console.log(`in msg:${JSON.stringify(msg)}.........`);
}

function logOut(msg){
  console.log(`out msg:${JSON.stringify(msg)}.........`);
}

var gunOpts = {
  web: server,
  localStorage: false,
  secret: skySecret, 
  portal: skyPortal, 
  debug: skyDebug,
  file: skyRadata,
  radisk: skyRadisk,
  until: skyUntil
}

if (process.env.RADISK) {
  console.log('Enabling radisk due to envvar')
  gunOpts['radisk'] = true;
}

if (process.env.PEERS) {
  console.log('Setting peers based on envvar:', process.env.PEERS)
  gunOpts['peers'] = process.env.PEERS.split(',');
}         

var gun = zenbase(gunOpts);

gun._.on('in', logIn);
gun._.on('out', logOut);

function logPeers() {
  console.log(`Peers: ${Object.keys(gun._.opt.peers).join(', ')}`);
}

function logData() {
  console.log(`In Memory: ${JSON.stringify(gun._.graph)}`);
}

setInterval(logPeers, 5000); //Log peer list every 5 secs
setInterval(logData, 20000); //Log gun graph every 20 secs

const view = path.join(__dirname, 'view/main.html');

app.use(express.static('view'));
app.get('*', function(_, res) {
  res.sendFile(view);
});



