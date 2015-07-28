var query = require('./querydb.js')

module.exports.checkToken = function(host, db, callback){
  query.search (host, {'host':host}, db, function(found){ 
    if (found != null){
        console.log ('found user');
        callback (true, found);
    }else{
    	console.log ('the user has not logged in');
    	callback (false, null);
    }
  });
};