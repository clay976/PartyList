//API Wrappers
spotifyAPI              = require ('config/SpotifyAPI')

var model = require ('database/models')

module.exports = function validate (host){
	return new Promise (function (fulfill, reject){
		model.Host.findOne({ 'hostID' : host.spotifyID }).exec()
		.then (function (databaseHost){
			if (databaseHost){
				host.databaseHost = databaseHost
				spotifyAPI.setAccessToken (databaseHost.access_token)
				fulfill (host)
			}else{
				reject ({
					statusCode	: 401,
					stack 		: "database/host/validate",
					message		: "validation error: could not find this host in our database, You must log in to continue"
				})
			}
		})
		.catch (function (err){
			reject (err)
		})
	})
}