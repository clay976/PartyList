function search (collect, docu, db){
  var assert = require('assert')
  var promise =db.collection(collect).find(docu)
  
  promise.toArray(function (err, doc) {
    assert.equal(err, null)
    return (doc [0]) 
  })
}
module.exports = {
	search: search
}