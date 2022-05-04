const path = require('path');
const express = require('express');
const Gun = require('gun');
//const SEA = require("gun/sea");
var {Radix} = require('gun/lib/radix');
var {Radisk} = require('gun/lib/radisk');
var Store = require('gun/lib/store');
var {RindexedDB} = require('gun/lib/rindexed');

// Import the Skynet GunDB Adapter
var { zenbase } = require('skynet-gundb-adapter');

const port = (process.env.PORT || 80);
const host = '0.0.0.0';

var skySecret = "SkyDB GunDB Production Super Top Secret"; 
var skyPortal = "https://siasky.net";
var skyDebug = true;
var skyUntil = 2*1000; 
var skyRadisk = true;
var skyRadata = "radata";
var gunDebug = false;
var gunDebugLevel = 1; // 1 or 2

const app = express();
app.use(zenbase.serve);

const gunRelaySkynetServer = app.listen(port, host);

console.log(`gunRelaySkynetServer listening on http://${host}:${port}`);

function logIn(msg){
  console.log(`in msg:${JSON.stringify(msg)}.........`);
}

function logOut(msg){
  console.log(`out msg:${JSON.stringify(msg)}.........`);
}

var gunOpts = {
  web: gunRelaySkynetServer,
  localStorage: false,
  secret: skySecret, 
  portal: skyPortal, 
  debug: skyDebug,
  skynetApiKey: undefined,
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

if (gunDebug === true) {
  if (gunDebugLevel === 1) {
    gun._.on('in', logIn); //log anything that is coming in
    gun._.on('out', logOut); //log anything that is coming in  
  } else {
    if (gunDebugLevel === 2) {
      gun._.on('in', logIn);
      gun._.on('get', (data)=>{console.log('GUN-GET: '+data.get['#'])});
      gun._.on('out', logOut);
      gun._.on('put', (data)=>{console.log('GUN-PUT: '+JSON.stringify(data.put))});
    } else {
      console.log('no gunDebug!');
    }
  }
}

function logPeers() {
  console.log(`Peers: ${Object.keys(gun._.opt.peers).join(', ')}`);
}

function logData() {
  console.log(`In Memory: ${JSON.stringify(gun._.graph)}`);
}

setInterval(logPeers, 10000); //Log peer list every 10 secs
setInterval(logData, 20000); //Log gun graph every 20 secs

const view = path.join(__dirname, 'client/main.html');

app.use(express.static('client'));
app.get('*', function(_, res) {
  res.sendFile(view);
});



