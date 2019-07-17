module.exports = function validateNewPlaylistInput (host) {
  return new Promise (function (fulfill, reject){
    if (host.newPlaylistName) fulfill (host)
  	else{
  		err = {
  			stack	: 'services/spotify/playlist/tools/validateNewPlaylistInput',
  			message	: 'we did not recieve playlist information'
  		}
  		reject (err)
  	} 
  })
}