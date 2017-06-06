function userPlaylists (host, playlists, length){
	var playlistJSON = '{ "playlists": ['
  for (var index = 0; index < length; index ++){
  	if (playlists[index].owner.id === host){
    	playlistJSON = playlistJSON + '{"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '", "owner": "'+playlists[index].owner.id+'"}'
    	if (index < (length-1)) playlistJSON = playlistJSON + ','
 		}
  }
  playlistJSON = JSON.parse (playlistJSON + ']}')
  return (playlistJSON)
}

module.exports = {
  userPlaylists: userPlaylists,
}