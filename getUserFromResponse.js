
function getUserFromResponse(response) {

  const req = response.req

  // https://www.pabbly.com/tutorials/express-js-request-response/
  //
  // Request Object Properties
  // req.app	    Used to hold a reference to the instance of the express application.
  // req.body	    Contains key-value pairs of data submitted in the request body. By default, it is undefined and is populated when you use body-parsing middleware such as body-parser.
  // req.cookies	This property contains cookies sent by the request, used for the cookie-parser middleware.
  // req.ip	      req.ip is remote IP address of the request.
  // req.path	    req.path contains the path part of the request URL.
  // req.route    req.route is the currently-matched route.

  let id = '-'
  let user = '-'
  if (req.cookies) {
    id = req?.cookies["NCTR_REMOTE_ID"] || '-'
    user = req?.cookies["NCTR_REMOTE_USER"] || '-'
  } else {
    console.log('--- getUserFromResponse() no req.cookies ---');   // TODO: take this out
  }

  const ip = req.ip

  return {user, id, ip}

}

module.exports = getUserFromResponse
