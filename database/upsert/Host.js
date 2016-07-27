
function Host (data){

	console.log (data)
	var host = mongoose.Schema({
	  hostID 				: String,
	  access_token	: String,
	  expires_in		: Number,
	  refresh_token	: String,
	  playlistID		: String
	})
	return host
}