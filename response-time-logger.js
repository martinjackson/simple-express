
const getUserFromResponse = require('./getUserFromResponse.js')

// Taken from
//   http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/

const QUEUE_LIMIT = 10000
const responseQueue = []

// response-time-logger.js
function logResponseTime(req, res, next) {
  const startHrTime = process.hrtime()
  const when = (new Date()).toLocaleString('en-US')

  const port = req.socket.address().port

  console.log("%d: REQ-IN:   %s  %s ", port, when, req.path);   // 2 extra spaces to line up with REQ-STAT

  req.on("error", error => {
    console.log("%d: REQ-ERROR: %s  %s ", port, when, req.path, error.message);
  });

  res.on("error", error => {
    console.log("%d: RESP-ERROR: %s  %s ", port, when, req.path, error.message);
  });

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    const {user, ip} = getUserFromResponse(res)

    console.log("%d: REQ-STAT: %s  %s : %fms %s %s", port, when, req.path, elapsedTimeInMs, user, ip);

    responseQueue.push({when, path: req.path, elapsedTimeInMs, user, ip})
    if (responseQueue.length > QUEUE_LIMIT) {
        responseQueue.shift()    // only keep the last 10,000 in memory -- parse the log files if you need more
    }
  });

  next();
}

module.exports = { logResponseTime, responseQueue } ;
