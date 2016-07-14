function findHost = function(searchQ){
  return (
    { "host" : searchQ }) 
}

function findTrack = function(trackID){
  return (
    { "trackId":trackID}) 
}

function findGuest = function(phoneNum){
  return (
    { "phone" : phoneNum }) 
} 

module.exports {
	findHost : findHost
	findTrack :	findTrack
	findGuest : findGuest
}