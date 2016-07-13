/*setInterval(function refreshToken () {
  var refresh_token
  query.search (host,doc, db, function (docum){
    refresh_token = docum.refresh_token
    request.post(makeJSON.acessFromRefresh(refresh_token), function (error, response, body) {
      if (!error && response.statusCode === 200) {
        update.updater (host, query.findHost (host), update.accessToken (body.access_token),db, function (error){
          console.log ('updated the access token')
        })
      }
    })
  })
}, 3540000)*/