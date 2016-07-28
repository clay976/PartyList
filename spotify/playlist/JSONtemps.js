function userPlaylists (host, playlists, length){
	var playlistJSON = '{ "playlists": ['
  for (var index = 1; index < length; index ++){
  	if (playlists[index].owner.id === host){
    	playlistJSON = playlistJSON + '{"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '", "owner": "'+playlists[index].owner.id+'"}'
    	if (index < (length-1)) playlistJSON = playlistJSON + ','
 		}
  }
  return (JSON.parse (playlistJSON + ']}'))
}

module.exports = {
  userPlaylists: userPlaylists,
}