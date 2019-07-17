function userPlaylists (host, playlists, length){
  return new Promise (function (fulfill, reject){
    if (length > 20){
    length = 20
    }
    var userPlaylistJSON = []
    var userPlaylistCount = 0
    for (var index = 0; index < length; index ++){
      if (playlists[index].owner.id === host){
        userPlaylistJSON[userPlaylistCount] = {}
        userPlaylistJSON[userPlaylistCount].name = playlists[index].name
        userPlaylistJSON[userPlaylistCount].id = playlists[index].id
        userPlaylistJSON[userPlaylistCount].owner = playlists[index].owner.id
        userPlaylistCount = userPlaylistCount + 1
      }
    }
    console.log (userPlaylistJSON)
    fulfill (userPlaylistJSON)
  })
}

module.exports = {
  userPlaylists: userPlaylists
}