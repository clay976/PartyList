var query = require ('../databasetools/querydb');
var insert = require ('../databasetools/insert');

// searches the database and sees wheter the someone
// who is already a host needs to just update the tokens
// or someone who is new who needs a new document
function updateOrInsert (res, db, host, docuSearch, access_token, refresh_token){
  query.search (host, docuSearch, db, function (found){
    //error handling within the found funtion itself 
    if (found != null){
      console.log ('user has been found');
      // found host so we will update their tokens to access api
      var updateInfo = update.bothTokens (access_token, refresh_token);
      update.updater (host, found, updateInfo,db, update.updateResponseHandler);
      res.redirect ('/#' +querystring.stringify({access_token: access_token,refresh_token: refresh_token}));
    }else{
      console.log ('creating new user');
      var docuInsert = insert.apiInfo (host,access_token, refresh_token);
      insert.insert (host, docuInsert, db, insert.insertResponseHandler);
      res.redirect ('/#' +querystring.stringify({success: 'you have been added as a host user'}));
    }
  })
}
module.exports{
	updateOrInsert: updateOrInsert
}