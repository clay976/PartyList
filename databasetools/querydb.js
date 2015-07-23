var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/party';
 
module.exports.findHost = function(searchQ){
  return (
    { "host" : searchQ }) 
};

module.exports.findTrack = function(trackID){
  return (
    { "trackId":trackID}) 
};

module.exports.findGuest = function(phoneNum){
  return (
    { "phone" : phoneNum }) 
}; 

module.exports.findPLaylist = function(ID){
  return (
    { "playlistID" : ID }) 
}; 

module.exports.search = function (collect, docu, callback){ 
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor =db.collection(collect).find(docu);
    cursor.toArray(function(err, doc) {
      assert.equal(err, null);
      db.close();
      callback (doc [0]) 
    })
  });
};