function responseHandler (err, results) {
  if (err){
    console.log ('there was an error inserting the document')
  }else{
    console.log ('document inserted succsefully')
  }
}

module.exports = {
  responseHandler: responseHandler
}