function userPlaylists (playlists, length){
  var playlistJSON = '{ "playlists": [{"name": "' +playlists[0].name+ '", "id" : "' +playlists[0].id+ '"}]'
  for (var index = 1; index < length; index ++){
    playlistJSON = playlistJSON + ', [{"name": "' +playlists[index].name+ '", "id" : "' +playlists[index].id+ '"}]'
  }
  console.log (playlistJSON+ '}')
  return (playlistJSON + '}')
}

module.exports = {
  userPlaylists: userPlaylists,
}