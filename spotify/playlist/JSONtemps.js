function userPlaylists (host, playlists, length){
	if (length > 20){
		length = 20
	}
	var playlistJSON = '{"playlists": ['
  for (var index = 0; index < length; index ++){
  	if (playlists[index].owner.id === host){
    	playlistJSON = playlistJSON + '{"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '", "owner": "'+playlists[index].owner.id+'"},'
 		}
  }
  playlistJSON = playlistJSON + '{"name": "none", "id" : "none", "owner": "none"}]}'
  return (playlistJSON)
}

module.exports = {
  userPlaylists: userPlaylists,
}