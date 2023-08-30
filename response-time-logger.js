
// Taken from
//   http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/

const QUEUE_LIMIT = 10000
const responseQueue = []

// response-time-logger.js
function logResponseTime(req, res, next) {
  const startHrTime = process.hrtime()
  const when = (new Date()).toLocaleString('en-US')

  console.log("REQ-IN: %s  %s ", when, req.path);

  req.on("error", error => {
    console.log("REQ-ERROR: %s  %s ", when, req.path, error.message);
  });

  res.on("error", error => {
    console.log("RESP-ERROR: %s  %s ", when, req.path, error.message);
  });

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    let id = '-'
    let user = '-'
    if (req.cookie) {
        id = req?.cookies["NCTR_REMOTE_ID"] || '-'
        user = req?.cookies["NCTR_REMOTE_USER"] || '-'
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    console.log("REQ-STAT: %s  %s : %fms %s %s %s", when, req.path, elapsedTimeInMs, id, user, ip);

    responseQueue.push({when, path: req.path, elapsedTimeInMs, id, user, ip})
    if (responseQueue.length > QUEUE_LIMIT) {
        responseQueue.shift()    // only keep the last 10,000 in memory -- parse the log files if you need more
    }
  });

  next();
}

module.exports = { logResponseTime, responseQueue } ;