module.exports = function updatePlaylistSettings (host){
	return new Promise (function (fulfill, reject){
    	host.databaseHost.explicit 		= host.settings.explicit
    	host.databaseHost.minYear 		= host.settings.minYear
    	host.databaseHost.maxYear 		= host.settings.maxYear
    	host.databaseHost.reqThreshold 	= host.settings.reqThreshold
   		fulfill (host)	
	})
}