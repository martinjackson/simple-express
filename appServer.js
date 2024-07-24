
// cSpell: ignore killable resave

const fs = require('fs')
const { exists } = require('fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const https = require("https")
const helmet = require('helmet')
const http  = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// const serveIndex = require('serve-index')
const session = require('express-session')
const dotenv = require('dotenv')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const getFQDN = require('get-fqdn')
const killable = require('killable')
const compression = require('compression')

const debug = require('./server-debug.js')
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
          default: 80
        })
        .option('fqdn', {
          description: 'fully qualified domain name',
          default: null
        })
        .option('https', {
          type: 'boolean',
          description: 'Run with http protocol (default is http)',
          default: false
        })
        .option('public', {
          type: 'string',
          description: 'location of public directory',
          default: '../public'
        })
        .help()
        .alias('help', 'h')
        .argv

    const router = makeRouter(argv)

    const httpsFlag = (argv.https) ? true: false
    const config = {
      port: argv.port,
      fqdn: argv.fqdn,
      publicDir: argv.public,
      httpsFlag: httpsFlag,
      requestCert: false
    }
    startHardenedServer(router, config)

    return argv
}


// -----------------------------------------------------------------------------------------------
export const startHardenedServer = async (router, config) => {

  const defaultConfig = {
    port:80,
    publicDir:'.',
    httpsFlag:false,
    requestCert:false,
    sessionSecret: crypto.randomBytes(20).toString("hex"),      // every server restart -- all previous cookies are invalid
  }

  let {port, fqdn, publicDir, httpsFlag, requestCert, sessionSecret} = {...defaultConfig, ...config}

  // console.log(`${port}: fqdn: '${fqdn}'`, 'publicDir:', publicDir, 'httpsFlag:', httpsFlag, 'requestCert:', requestCert);

  const protocol = (httpsFlag) ? 'https' : 'http'
  let hostname = (fqdn) ? fqdn : 'localhost'

  console.log(`${port}: Starting ${protocol}://${hostname}:${port}`, process.pid)

  if (!fqdn) {
    try {
      fqdn = await getFQDN()
    } catch (err) {
      console.error('get-fqdn error:', err)
    }
  }

  if (fqdn.endsWith('.')) {
    fqdn = fqdn.slice(0, -1)
    console.log(port+':','fqdn trimmed.', fqdn);
  }

  const home = (fs.existsSync(publicDir)) ? publicDir : '.'

  const app = express()

  // make req.sessionID and req.session.id available
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,         // allow js on client to see
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }))

  app.use(cookieParser())

  // cookies and session processing before logging the request and response times
  app.use(logResponseTime)          // put each request's response time in the log file

  const limit = '50mb'      // default is 1mb
  app.use(express.json({limit}))                          // for parsing application/json
  app.use(express.urlencoded({ limit, extended: true }))  // for parsing application/x-www-form-urlencoded

  //  port1 = 443   app1.use(cors({credentials: true}))   ssl options1 = { ...ssl, requestCert: false }
  //  port2 = 4430  app2 did not call cors at all         ssl options2 = { ...ssl, requestCert: true  }

  if (!requestCert) {
    app.use(cors({credentials: true}))
    // console.log(port+':','app.use(cors({credentials: true}))');
  } else {
    // app.use(cors());        // original node-util port 4430 did not call cors at all
    // console.log(port+':','startHardenedServer() app.use(cors()) not called.');
  }

  addMonitorRoutes(router)
  app.use(router)

  const fPath = path.join(home, 'index.html')
  exists(fPath, (exists) => {
    if (exists) {
      // console.log(port+':','Found', fPath);
    } else {
      console.log(port+':','Creating missing', fPath);
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
      fs.writeFile(fPath, page, err => {
        if (err) {
          console.error('Error writing missing', fPath, 'error:', err);
        } else {
          console.log(port+':', 'Created missing', fPath, 'w/o error.');
        }
      });
    }
  })

  // http://expressjs.com/en/resources/middleware/compression.html
  app.use(compression({ filter: shouldCompress }))   // added 2023-09-23 maj

  function shouldCompress (req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
  }

  app.use(express.static(home, {fallthrough: false}))     // serve up static content

  // app.use(serveIndex(home))     // serve a directory view   -- this echos back when directory not found
                                   //  and allows XSS
/*
https:/someHost:3555/dist/main.js/%3c%73%43%72%49%70%54%3e%61%6c%65%72%74%28%35%32%31%36%38%29%3c%2f%73%43%72%49%70%54%3e
aka. https:/someHost:3555/dist/main.js/<sCrIpT>alert(36262)</sCrIpT>
*/

   // removed       ${error.message}  as text after the H1 --- allows  cross site scripting XSS

  const errorHandler = (error, request, response, _next) => {
    // Error handling middleware functionality
    console.log(port+':', `error ${error.message}`, error) // log the error

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
      Code: ${error.status}
    </body>
    </html>
    `

    const status = error.status || 400
    response.status(status)
    response.send(page);

  }

  app.use(errorHandler)

  const server = start(app, port, httpsFlag, fqdn, requestCert)

  // after the log redirect
  // console.log(port+':',`home: ${home}  unknown-urls: ${fPath}`)

  return server
}

// -----------------------------------------------------------------------------------------------
function start(app, port, httpsFlag, fqdn, requestCert=false) {

    let server
    let sslOptions = null

    const protocol = (httpsFlag) ? 'https' : 'http'
    let hostname = (fqdn) ? fqdn : 'localhost'

    // console.log('argv:', process.argv)
    // console.log('API_PORT:', port)
    console.log(`${port}: ${protocol}://${hostname}:${port}`)   // goes to log file, if there is one...

    if (!httpsFlag) {
       server = http.createServer(app)
    } else {
      const ONE_YEAR = 31536000000
      app.use(helmet.hsts( {maxAge: ONE_YEAR, includeSubDomains: true, force: true} ))

      sslOptions = genSSLOptions(fqdn, requestCert, port)
      server = https.createServer(sslOptions, app)
    }

    shutdownSetup()

    if (sslOptions && sslOptions.startupMessage) {
      sslOptions.startupMessage.map(line => console.log(port+':',line))
    }

    debug(server, port, hostname)
    server.listen(port, function(err) {
      if (err) {
        console.log(port+':',"Error in server setup")
        console.log(port+':','Err:', err)
      } else {
        console.log(port+':',"Server listening on Port", port)
      }
      console.log(port+':','')         // some terminal prompts need <CR> after last output
    })

    killable(server)

    return server
}

// -------------------------------------------------------------------------------------------------
function atomicSave(fileName, obj, id) {
  try {
    const temp = `${fileName}-temp-${id}`
    const dest = `${fileName}`
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

// Where fileName is name of the file and response is Node.js Response.
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
