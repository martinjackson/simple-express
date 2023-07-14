
const fs = require('fs');
const path = require('path');
// const os = require('os');
const crypto = require('crypto');

const express = require('express');
const https = require("https");
const http  = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const serveIndex = require('serve-index');
const session = require('express-session')
const dotenv = require('dotenv');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const getFQDN = require('get-fqdn');

const debug = require('./server-debug.js');
const log = require('./server-log.js');
const { logResponseTime } = require("./response-time-logger");

const addMonitorRoutes = require('./apiMonitorRoutes.js');


// -----------------------------------------------------------------------------------------------
const serve = async (makeRouter, dotEnvPath) => {

    console.log('dotenv: ', dotEnvPath);
    const result = dotenv.config({ path: dotEnvPath })
    if (result.error) {
      console.log('dotenv error:', result.error);
      throw result.error
    }

    if (!process.env.FQDN) {
      try {
        process.env.FQDN = await getFQDN();
      } catch (err) {
        console.error('get-fqdn error:', err);
      }
    }

    const argv = yargs(hideBin(process.argv))
        .option('port', {
          alias: 'p',
          type: 'number',
          description: 'port to bind on',
          default: process.env.API_PORT
        })
        .option('fqdn', {
          description: 'fully qualified domain name',
          default: process.env.FQDN
        })
        .option('http', {
          type: 'boolean',
          description: 'Run with http protocol (default is https)'
        })
        .option('nolog', {
          alias: 'n',
          type: 'boolean',
          description: 'do not output to log file'
        })
        .option('logFile', {
          alias: 'l',
          type: 'string',
          description: 'name of log file',
          default: path.join('.','logs','server.log')
        })
        .option('public', {
          type: 'string',
          description: 'location of public directory',
          default: '../public'
        })
        .help()
        .alias('help', 'h')
        .argv

    const logFile = (argv.nolog) ? null : argv.logFile
    const home = (fs.existsSync(argv.public)) ? argv.public : '.'

    const app = express();

    app.use(logResponseTime);          // put each request's response time in the log file

    /*
    if (!argv.nomonitor) {
      // npm install express-status-monitor --save
      const statusMonitor = require('express-status-monitor')();

      app.use(statusMonitor);
      app.get('/status', statusMonitor.pageRoute)
    }
    */

    // make req.sessionID and req.session.id available
    app.use(session({
      secret: crypto.randomBytes(20).toString("hex"),      // every server restart -- all previous cookies are invalid
      resave: false,
      saveUninitialized: true
    }))

    const limit = '50mb'      // defailt is 1mb
    app.use(express.json({limit}))                          // for parsing application/json
    app.use(express.urlencoded({ limit, extended: true }))  // for parsing application/x-www-form-urlencoded
    app.use(cors());
    app.use(cookieParser())

    const router = makeRouter(argv)
    addMonitorRoutes(router)
    app.use(router);

    const fpath = path.join(home, 'index.html');

    app.use(express.static(home));     // serve up static content
    app.use(serveIndex(home));         // serve a directory view

    // field all unanswered request and reply with the SPA (Single Page App)
    app.use((req, res, _next) => {
        const type = path.extname(fpath);
        res.setHeader("content-type", type);
        fs.createReadStream(fpath).pipe(res);
    })

    start(app, argv.port, !argv.http, logFile, argv.fqdn)

    // after the log redirect
    console.log(`home:${home}  unknown-urls:${fpath}`)

    return argv
}


// -----------------------------------------------------------------------------------------------
function start(app,port,httpsFlag,logFileName, fqdn) {


  // node server.js http INVM (turns off SSL stuff)
    let protocol
    let server
    let sslOptions = null
    let hostname = (fqdn) ? fqdn : 'localhost'

    if (!httpsFlag) {
       server = http.createServer(app)
       protocol = 'http'
    } else {
      const {genSSLOptions} = require('./sslOptions.js');
       sslOptions = genSSLOptions(fqdn)
       server = https.createServer(sslOptions, app);
       protocol = 'https'
    }

    // on stdout for vscode (before redirected to log file),
    // so vscode will detecct and auto-setup ssh redirect
    // from remote ssh to localhost
    console.log(`Starting ${protocol}://${hostname}:${port}`, process.pid,'\n\n')

    if (logFileName !== null) {
      log(logFileName)
    }

    // console.log('argv:', process.argv);
    console.log('API_PORT:', port);
    console.log(`${protocol}://${hostname}:${port}`)   // goes to log file

    if (sslOptions && sslOptions.startupMessage) {
      sslOptions.startupMessage.map(line => console.log(line))
    }

    debug(server, port, hostname);
    server.listen(port, function(err) {
      if (err) {
        console.log("Error in server setup")
        console.log('Err:', err);
      } else {
        console.log("Server listening on Port", port);
      }
      console.log('');
      console.log('');
      console.log('');         // some terminal prompts need <CR> after last output
    });
}

// -------------------------------------------------------------------------------------------------
function atomicSave(fname, obj, id) {
  try {
    const temp = `${fname}-temp-${id}`
    const dest = `${fname}`
    fs.writeFileSync(temp, JSON.stringify(obj, null, 2))
    fs.copyFile(temp,dest, (err) => {
      if (err) throw err;
      // console.log(dest+' was updated.');
    });
    fs.rmSync(temp)
  } catch (err) {
    console.error(err)
  }
}

// Where fileName is name of the file and response is Node.js Reponse.
// -------------------------------------------------------------------------------------------------
function responseFile(filePath, response) {

  // Check if file specified by the filePath exists
  fs.exists(filePath, function(exists){
      if (exists) {
        // Content-type is very interesting part that guarantee that
        // Web browser will handle response in an appropriate manner.

        response.status(200)
        response.append("Content-Type", "application/octet-stream")
        response.append("Content-Disposition", "attachment; filename=" + filePath)
        fs.createReadStream(filePath).pipe(response);
      } else {
        response.status(404).send("ERROR File does not exist: "+filePath);
      }
    });
}



module.exports = { serve, atomicSave, responseFile }
