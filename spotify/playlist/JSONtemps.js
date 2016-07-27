function userPlaylists (data){
  console.log (data.body.items)
  return {
    playlists : data.body.items
  }
}

module.exports = {
  userPlaylists: userPlaylists,
}