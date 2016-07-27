function userPlaylists (data){
  var playlists = data.body.items
  for (var index = 0; index < (playlists).length(); index ++){
    console.log (playlists [index].id)
    console.log (playlists [index].name)
  }
  return {
    "playlists" :  data.body.items
  }
}

module.exports = {
  userPlaylists: userPlaylists,
}