/* eslint-disable indent */

// const { serve } = require('../appServer.js')
// const { argv } = require('process')

const { startHardenedServer }  = require('../appServer.js')
const { log } = require('../server-log.js')

const apiRoutes = require('./apiRoutes.js')

// serve(apiRoutes, './.env')

const router = apiRoutes()
let logFile=null

if (process.argv.length === 4) {
    logFile = process.argv[3]        // node ./server2.js SIMPLE_EXPRESS_TEST logs/server.log
}

if (logFile) {
    log(__dirname+logFile)
  }


const config = {
    port: 8000,
    fqdn: 'localhost',
    publicDir: './public/',
  }

startHardenedServer(router, config)
