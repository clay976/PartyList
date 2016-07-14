function search (collect, docu, db, callback){
  var assert = require('assert')
  var cursor =db.collection(collect).find(docu)
  
  cursor.toArray(function (err, doc) {
    assert.equal(err, null)
    callback (doc [0]) 
  })
}
module.exports = {
	search: search
}