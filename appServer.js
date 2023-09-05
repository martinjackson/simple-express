
const fs = require('fs')
const { exists } = require('node:fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const https = require("https")
const helmet = require('helmet')
const http  = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const serveIndex = require('serve-index')
const session = require('express-session')
const dotenv = require('dotenv')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const getFQDN = require('get-fqdn')
const killable = require('killable')

const debug = require('./server-debug.js')
const { log } = require('./server-log.js')
const { shutdownSetup } = require('./server-shutdown.js')
const { logResponseTime } = require("./response-time-logger")

const addMonitorRoutes = require('./apiMonitorRoutes.js')
const {genSSLOptions} = require('./sslOptions.js')

// -----------------------------------------------------------------------------------------------
const serve = async (makeRouter, dotEnvPath) => {

    console.log('dotenv: ', dotEnvPath)
    const result = dotenv.config({ path: dotEnvPath })
    if (result.error) {
      console.log('dotenv error:', result.error)
      throw result.error
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
          default: null
        })
        .option('http', {
          type: 'boolean',
          description: 'Run with http protocol (default is https)',
          default: false
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

    const router = makeRouter(argv)


    const httpsFlag = (argv.http) ? false : true
    startHardenedServer(router, argv.port, logFile, argv.fqdn, argv.public, httpsFlag)

    return argv
}


// -----------------------------------------------------------------------------------------------
const startHardenedServer = async (router, port=3000, logFile=null, fqdn=null,
  publicDir='.', httpsFlag=true, requestCert=false) => {

  console.log('port:', port, 'logFile:', logFile, `fqdn: '${fqdn}'`, 'publicDir:', publicDir, 'httpsFlag:', httpsFlag);

  if (!fqdn) {
    try {
      fqdn = await getFQDN()
    } catch (err) {
      console.error('get-fqdn error:', err)
    }
  }

  if (fqdn.endsWith('.')) {
    fqdn = fqdn.slice(0, -1)
    console.log('fqdn trimmed.', fqdn);
  }

  const home = (fs.existsSync(publicDir)) ? publicDir : '.'

  const app = express()

  app.use(logResponseTime)          // put each request's response time in the log file

  // make req.sessionID and req.session.id available
  app.use(session({
    secret: crypto.randomBytes(20).toString("hex"),      // every server restart -- all previous cookies are invalid
    resave: false,
    saveUninitialized: true
  }))

  const limit = '50mb'      // defailt is 1mb
  app.use(express.json({limit}))                          // for parsing application/json
  app.use(express.urlencoded({ limit, extended: true }))  // for parsing application/x-www-form-urlencoded

  //  port1 = 443   app1.use(cors({credentials: true}))   ssl options1 = { ...ssl, requestCert: false }
  //  port2 = 4430  app2 did not call cors at all         ssl options2 = { ...ssl, requestCert: true  }

  if (!requestCert) {
    app.use(cors({credentials: true}))
  } else {
    app.use(cors());        // original node-util port 4430 did not call cors at all
  }

  app.use(cookieParser())

  addMonitorRoutes(router)
  app.use(router)

  const fpath = path.join(home, 'index.html')
  exists(fpath, (exists) => {
    if (exists) {
      console.log('Found', fpath);
    } else {
      const page = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Default index.html</title>
      </head>
      <body>
        <h1>Default index.html</h1>
      </body>
      </html>
      `
      fs.writeFile(fpath, page, err => {
        if (err) {
          console.error('Error writing missing', fpath, 'error:', err);
        } else {
          console.log('Created missing', fpath, 'w/o error.');
        }
      });
    }
  })

  app.use(express.static(home))     // serve up static content
  app.use(serveIndex(home))         // serve a directory view

  const errorHandler = (error, request, response, _next) => {
    // Error handling middleware functionality
    console.log( `error ${error.message}`) // log the error

    // send back an easily understandable error message to the caller

    const page = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Something went wrong</title>
    </head>
    <body>
      <h1>Something went wrong</h1>
      ${error.message}
    </body>
    </html>
    `

    const status = error.status || 400
    response.status(status)
    response.send(page);

  }

  app.use(errorHandler)

  const server = start(app, port, httpsFlag, logFile, fqdn, requestCert)

  // after the log redirect
  console.log(`home: ${home}  unknown-urls: ${fpath}`)

  return server
}

// -----------------------------------------------------------------------------------------------
function start(app,port,httpsFlag,logFileName, fqdn, requestCert=false) {

  // node server.js http INVM (turns off SSL stuff)
    let protocol
    let server
    let sslOptions = null
    let hostname = (fqdn) ? fqdn : 'localhost'

    if (!httpsFlag) {
       server = http.createServer(app)
       protocol = 'http'
    } else {
      sslOptions = genSSLOptions(fqdn, requestCert)

      const ONE_YEAR = 31536000000
      app.use(helmet.hsts({
          maxAge: ONE_YEAR,
          includeSubDomains: true,
          force: true
          }))
       server = https.createServer(sslOptions, app)
       protocol = 'https'
    }

    // on stdout for vscode (before redirected to log file),
    // so vscode will detecct and auto-setup ssh redirect
    // from remote ssh to localhost
    console.log(`Starting ${protocol}://${hostname}:${port}`, process.pid,'\n\n')

    shutdownSetup()

    if (logFileName !== null) {
      log(logFileName)
    }

    // console.log('argv:', process.argv)
    // console.log('API_PORT:', port)
    console.log(`${protocol}://${hostname}:${port}`)   // goes to log file

    if (sslOptions && sslOptions.startupMessage) {
      sslOptions.startupMessage.map(line => console.log(line))
    }

    debug(server, port, hostname)
    server.listen(port, function(err) {
      if (err) {
        console.log("Error in server setup")
        console.log('Err:', err)
      } else {
        console.log("Server listening on Port", port)
      }
      console.log('')
      console.log('')
      console.log('')         // some terminal prompts need <CR> after last output
    })

    killable(server)

    return server
}

// -------------------------------------------------------------------------------------------------
function atomicSave(fname, obj, id) {
  try {
    const temp = `${fname}-temp-${id}`
    const dest = `${fname}`
    fs.writeFileSync(temp, JSON.stringify(obj, null, 2))
    fs.copyFile(temp,dest, (err) => {
      if (err) throw err
      // console.log(dest+' was updated.')
    })
    fs.rmSync(temp)
  } catch (err) {
    console.error(err)
  }
}

// Where fileName is name of the file and response is Node.js Reponse.
// -------------------------------------------------------------------------------------------------
function responseFile(filePath, response) {

  // Check if file specified by the filePath exists
  exists(filePath, (exists) => {
      if (exists) {
        // Content-type is very interesting part that guarantee that
        // Web browser will handle response in an appropriate manner.

        response.status(200)
        response.append("Content-Type", "application/octet-stream")
        response.append("Content-Disposition", "attachment; filename=" + filePath)
        fs.createReadStream(filePath).pipe(response)
      } else {
        response.status(404).send("ERROR File does not exist: "+filePath)
      }
    })
}



module.exports = { serve, startHardenedServer, atomicSave, responseFile }
