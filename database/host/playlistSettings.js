var validateHost              	= require ('database/host/validate')
var updatePlaylistSettings		= require ('database/host/tools/updatePlaylistSettings')
var updatehost               	= require ('database/host/update')

var errorHandler              	= require ('services/errorHandling/errorHandler')

module.exports = function playlistSettings (host, res){
  validateHost (host)
  .then (updatePlaylistSettings)
  .then (updatehost)
  .then (function (host){
  	res.status(200).json (host.settings)
  })
  .catch (function (err){
    errorHandler (res, err)
  })
}