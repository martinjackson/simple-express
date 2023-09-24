
const { getUserFromRequest } = require('./getUserFromRequest.js')

// Taken from
//   http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/

const QUEUE_LIMIT = 10000
const responseQueue = []

// ---------------------------------------------------------
function logResponseTime(req, res, next) {
  const startHrTime = process.hrtime()
  const when = (new Date()).toLocaleString('en-US')

  const port = req.socket.address().port
  const method = req.method.padEnd(4,' ')

  // logResponseTime() has to be called after   app.use(session  app.use(cookieParser
  // otherwise the req will not have the session or cookie info for the logs (no user)
  let {user, ip} = getUserFromRequest(req)

  user = user.padEnd(15,' ')

   console.log("%d: REQ-IN:   %s  %s  %s  %s : %s  ",     port, when, user, ip, method, req.path)
// console.log("%d: REQ-STAT: %s  %s  %s  %s : %s  %fms", port, when, user, ip, method, req.path, elapsedTimeInMs)

  req.on("error", error => {
    console.log("%d: REQ-ERROR: %s  %s  %s ", port, when, method, req.path, error.message)
  })

  res.on("error", error => {
    console.log("%d: RESP-ERROR: %s  %s  %s ", port, when, method, req.path, error.message)
  })

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime)
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6

    const req = res.req
    let {user, ip} = getUserFromRequest(req)
    user = user.padEnd(15,' ')

    console.log("%d: REQ-STAT: %s  %s  %s  %s : %s  %fms", port, when, user, ip, method, req.path, elapsedTimeInMs)

    responseQueue.push({when, path: req.path, elapsedTimeInMs, user, ip})
    if (responseQueue.length > QUEUE_LIMIT) {
        responseQueue.shift()    // only keep the last 10,000 in memory -- parse the log files if you need more
    }
  })

  next()
}

module.exports = { logResponseTime, responseQueue }
