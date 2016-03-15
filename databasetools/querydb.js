var assert = require('assert')

module.exports.findHost = function(searchQ){
  return (
    { "host" : searchQ }) 
}

module.exports.findTrack = function(trackID){
  return (
    { "trackId":trackID}) 
}

module.exports.findGuest = function(phoneNum){
  return (
    { "phone" : phoneNum }) 
} 

module.exports.search = function (collect, docu, db, callback){ 
  var cursor =db.collection(collect).find(docu)
  cursor.toArray(function (err, doc) {
    assert.equal(err, null)
    callback (doc [0]) 
  })
}