function userPlaylists (host, playlists, length){
	var playlistJSON = '{ "playlists": ['
	if (playlists[0].owner.id = host) {
  	playlistJSON = playlistJSON+ '{"name": "' +playlists[0].name+ '", "id" : "' +playlists[0].id+ '"}'
  }
  for (var index = 1; index < length; index ++){
  	if (playlists[index].owner.id = host){
    	playlistJSON = playlistJSON + ', {"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '"}'
 		}
  }
  return (JSON.parse (playlistJSON + ']}'))
}

module.exports = {
  userPlaylists: userPlaylists,
}