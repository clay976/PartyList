var assert = require('assert')

//update playlist document
module.exports.playlistID = function(ID){
  return ({
    $set:{ "playlistID": ID }
  }) 
};

//update guests functions
module.exports.guestRequest = function(trackID){
  return ({
    $inc: { numRequests: -1},
    $addToSet: { "tracks": trackID }
  }) 
};

//update tracks function 
module.exports.tracksReqd = function(trackID){
  return ({
    $inc: { numRequests: 1}
  }) 
};

//update api info functions
module.exports.bothTokens = function(aToken, rToken){
  var d = new Date();
  time = d.getTime();
  return ({$set:{ 
    "access_token": aToken,
    "refresh_token": rToken,
    "time": time
  }}) 
};
module.exports.accessToken = function(aToken){
  var d = new Date();
  time = d.getTime();
  return ({$set:{ 
    "access_token": aToken,
    "time": time 
  }}) 
};
 
module.exports.updater = function (collection, doc, info,db, callback){ 
  db.collection(collection).updateOne(doc,info, function(err, results) {
    callback (err);
  });
};