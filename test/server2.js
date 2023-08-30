/* eslint-disable indent */

// const { serve } = require('@martinjackson/simple-express')

// const { serve } = require('../appServer.js')
const { argv } = require('process')
const { startHardenedServer }  = require('../appServer.js')

const apiRoutes = require('./apiRoutes.js')

// serve(apiRoutes, './.env')

const router = apiRoutes()
let logFile=null

if (process.argv.length === 4) {
    logFile = process.argv[3]        // node ./server2.js SIMPLE_EXPRESS_TEST logs/server.log
}

startHardenedServer(router, 8000, logFile, 'localhost', './public/', true)
