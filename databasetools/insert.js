
 
module.exports.playlist = function(host,ID){
  return({
    "playlistID":ID,
    "tracks":[]
  })
};
 
module.exports.guest = function(host,phoneNum, reqID){
  return({
    "phone":phoneNum,
    numRequests:5,
    "tracks":[reqID]
  })
};
module.exports.track = function(host,playID,trackID){
  return({ 
    "trackId":trackID,
    numRequests:1,
    timePlayed:0 
  })
};

module.exports.apiInfo = function (host, access, refresh){
  var d = new Date();
  time = d.getTime();
  return({
    "host":host,
    "clientId": "000adffbd26453fbef24e8c1ff69c3b",
    "clientSecret" : "899b3ec7d52b4baabba05d6031663ba2",
    "redirectUri" : "http://localhost:8888/callback",
    "access_token":access,
    "token_type":"Bearer",
    expires_in:3500000,
    "refresh_token": refresh,
    "time": time
  })
};

var insert = function(collect, docinsert, db, callback) {
  db.collection(collect).insertOne(docinsert, function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
};;