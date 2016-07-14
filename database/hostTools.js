var search = require ('./query/search')
var insertResponseHandler = require ('./insert/responseHandler')
var insertTemplate = require ('./insert/JSONtemps')
var updateResponseHandler = require ('./update/responseHandler')
var updateTemplate = require ('./update/JSONtemps')
var querystring = require('querystring')

// searches the database and sees wheter the someone
// who is already a host needs to just update the tokens
// or someone who is new who needs a new document
function UOIHost (res, db, host, docuSearch, access_token, refresh_token){
  search (host, docuSearch, db, function (found){
    if (found != null){
      console.log ('user has been found')
      db.collection(host).updateOne(found, updateTemplate.bothTokens (access_token, refresh_token), updateResponseHandler)
    }else{
      console.log ('creating new user')
      db.collection(host).insertOne(insertTemplate.apiInfo (host,access_token, refresh_token), insertResponseHandler)
    }
  })
  res.redirect ('/#' +querystring.stringify({access_token: access_token,refresh_token: refresh_token}))
}

function checkToken(host, db, callback){
  search (host, {'host':host}, db, function(found){ 
    if (found != null){
        callback (true, found)
    }else{
      callback (false, null)
    }
  })
}

module.exports = {
  UOIHost: UOIHost,
  checkToken: checkToken
}
