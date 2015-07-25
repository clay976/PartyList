var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/party';

var query = require('./querydb.js')

module.exports.checkToken = function(host, db, callback){
  query.search (host, {'host':host}, db, function(found){ 
    if (found != null){
        console.log ('found user');
        callback (true, found)
    }
  });
};