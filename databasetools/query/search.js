var assert = require('assert')

function (collect, docu, db, callback){
  var cursor =db.collection(collect).find(docu)
  
  cursor.toArray(function (err, doc) {
    assert.equal(err, null)
    callback (doc [0]) 
  })
}