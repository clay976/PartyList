var assert = require('assert')

module.exports.guest = function(host,phoneNum){
  return({
    "host": host,
    "phone":phoneNum,
    numRequests:4,
    "currentTrack":""
  })
}

module.exports.track = function(trackID){
  return({ 
    "trackId":trackID,
    numRequests:1,
    timePlayed:0 
  })
}

module.exports.apiInfo = function (host, access, refresh){
  return({
    "host":host,
    "clientId": "000adffbd26453fbef24e8c1ff69c3b",
    "clientSecret" : "899b3ec7d52b4baabba05d6031663ba2",
    "redirectUri" : "http://localhost:80/callback",
    "access_token":access,
    "token_type":"Bearer",
    expires_in:3500000,
    "refresh_token": refresh,
    "playlistID":"",
    "tracks":[]
  })
}

module.exports.insert = function(collect, docinsert, db, callback) {
  db.collection(collect).insertOne(docinsert, callback)
}

function reponseHandler(err, results) {
  if (err){
    console.log ('there was an error inserting the document')
  }else{
    console.log ('document inserted succsefully')
  }
}

module.exports = {
  reponseHandler: reponseHandler
}