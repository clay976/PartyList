function search (collect, docu, db){
  var assert = require('assert')
  var cursor =db.collection(collect).find(docu)
  
  cursor.toArray(function (err, doc) {
    assert.equal(err, null)
    return (doc [0]) 
  })
}
module.exports = {
	search: search
}