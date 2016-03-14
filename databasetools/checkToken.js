var query = require('./querydb.js')

module.exports.checkToken = function(host, db, callback){
  query.search (host, {'host':host}, db, function(found){ 
    if (found != null){
        callback (true, found)
    }else{
    	console.log ('the user has not logged in properly')
    	callback (false, null)
    }
  })
}