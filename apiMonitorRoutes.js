
const os = require('os');
const { responseQueue } = require("./response-time-logger");

const addMonitorRoutes = (router) => {

  // app.get(["/", "/api/health"], (req, res) => {
  //   res.send({ message: "OK", uptime: process.uptime() });
  //   ...
  //   });

  router.get('/api/health', (req, res) => {
    res.send({ message: "OK", uptime: process.uptime() });
  });

  router.get('/api/info/', function (req, res) {
    // console.log(`GET: /api/info/`);
    try {
        const info = {
            when: new Date().getTime(),
            cpus:     os.cpus(),
            homedir:  os.homedir(),
            hostname: os.hostname(),
            fqdn:     process.env.FQDN,
            platform: os.platform(),
            release:  os.release(),
          }
        res.json(info)
    } catch (err) {
      res.status(500).send("Error:"+err);
      console.error(err)
    }

  })

  router.get('/api/stats/', function (req, res) {
    // console.log(`GET: /api/stats/`);
    try {
        const memuse = process.memoryUsage()    // rss (Resident Set Size), heapTotal, heapUsed. external (memory used by C++ objects managed by V8)
        const stats = {
            when: new Date().getTime(),
            freemem:  os.freemem(),
            totalmem: os.totalmem(),
            uptime:   os.uptime(),
            loadavg:  os.loadavg(),
            ...memuse
          }
        res.json(stats)
    } catch (err) {
      res.status(500).send("Error:"+err);
      console.error(err)
    }

  })

  router.get('/api/response-stats/:n', function (req, res) {
    try {
        let n = req.params.n
        const ans = (n === '') ? responseQueue : responseQueue.slice(0, parseInt(n))
        res.json(ans)
    } catch (err) {
      res.status(500).send("Error:"+err);
      console.error(err)
    }
  })
}

module.exports = addMonitorRoutes;
