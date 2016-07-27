function auth (host, access_token){
  return {
    url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
    headers: {'Authorization': 'Bearer ' +access_token}
  }
}

function addSongToPlaylist (host, playlistID, trackID, access_token){
  return{
    url: "https://api.spotify.com/v1/users/" +host+ "/playlists/"+playlistID+ "/tracks",
    body: JSON.stringify({"uris": ["spotify:track:"+trackID]}),
    dataType:'json',
    headers: {
      Authorization: "Bearer " + access_token,
      "Content-Type": "application/json",
    }
  }
}

function createPlaylist (host, playlistName, access_token){
  return {
    url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
    body: JSON.stringify({
      'name': playlistName,
      'public': false
    }),
    dataType:'json',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    }
  }
}

module.exports = {
  auth: auth,
  addSongToPlaylist: addSongToPlaylist,
  createPlaylist: createPlaylist
}