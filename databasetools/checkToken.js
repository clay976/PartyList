var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/party';

var query = require('./querydb.js')

module.exports.checkToken = function(host, callback){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    query.search (host, {'host':host}, function(found){ 
      if (found != null){
        console.log ('found user');
        // found host so we will update their tokens to access api
        var d = new Date();
  		  time = d.getTime();
  		  if ((time - found.time) < (found.expires_in)){
          callback (true, found)
  		  }else{
          callback (false)
  		  }
      }
    });
  });
};