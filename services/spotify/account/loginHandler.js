//app modules
var requestSpotifyInfoOnLogin = require ('services/spotify/account/tools/requestSpotifyInfoOnLogin')
var checkForExistingUser      = require ('services/spotify/account/tools/checkForExistingUser')
var getHostPlaylists          = require ('services/spotify/account/tools/getHostPlaylists')
var finalizeLoginInformation  = require ('services/spotify/account/tools/finalizeLoginInformation')
var errorHandler              = require ('services/errorHandling/errorHandler')
var updateHostinDB            = require ('database/host/update')


// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
module.exports = function loginHandler (code, res) {
  requestSpotifyInfoOnLogin (code)
  .then (checkForExistingUser)
  .then (getHostPlaylists)
  .then (finalizeLoginInformation)
  .then (updateHostinDB)
  .then (function (host){
    res.status(200).redirect(host.databaseHost.homePage)
  })
  .catch (function (err){
  	errorHandler (res, err)
  })
}