
function guest (databaseObject){
	return ({
		"guest"					: databaseObject,
		"trackFound"		: null,
		"response"			: null,
		"guestUpdate"		: null,
		"trackUpdate"		: null,
		"spotifySearch"	: false
	})
}

module.exports = {
	guest	: guest
}