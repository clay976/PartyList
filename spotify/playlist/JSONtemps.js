function userPlaylists (data){
  var length = data.total
  var playlists = '{ playlists: { name: ' +data[0].name+ ', id : ' +data[0].id+ '}'
  for (var index = 1; index < length; index ++){
    playlists + ', { name: ' +data[index].name+ ', id : ' +data[index].id+ '}'
  }
  return (playlists + '}')
}

module.exports = {
  userPlaylists: userPlaylists,
}