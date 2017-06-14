function userPlaylists (host, playlists, length){
	var playlistJSON = '{ "playlists": ['
  for (var index = 0; index < length; index ++){
  	if (playlists[index].owner.id === host){
  		console.log (playlistJSON)
    	playlistJSON = playlistJSON + '{"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '", "owner": "'+playlists[index].owner.id+'"},'
 		}
  }
  console.log ('done creating')
  console.log (playlistJSON)
  playlistJSON = JSON.parse (playlistJSON + '{"name": "none", "id" : "none", "owner": "none"}]}')
  return (playlistJSON)
}

module.exports = {
  userPlaylists: userPlaylists,
}