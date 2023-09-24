
// ---------------------------------------------------------
function getUserFromRequest(req) {

  // https://www.pabbly.com/tutorials/express-js-request-response/
  //
  // Request Object Properties
  // req.app	    Used to hold a reference to the instance of the express application.
  // req.body	    Contains key-value pairs of data submitted in the request body. By default, it is undefined and is populated when you use body-parsing middleware such as body-parser.
  // req.cookies	This property contains cookies sent by the request, used for the cookie-parser middleware.
  // req.ip	      req.ip is remote IP address of the request.
  // req.path	    req.path contains the path part of the request URL.
  // req.route    req.route is the currently-matched route.

  const ip = req.ip
  let user = '-'

  if (req.cookies) {
    user = req?.cookies["NCTR_REMOTE_USER"] || '-'
  }

  if (req?.session?.user?.name) {
    user = req?.session?.user?.name
  }

  return {user, ip}

}

module.exports = { getUserFromRequest }
