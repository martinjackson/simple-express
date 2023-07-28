
const fs = require('fs')
require('log-timestamp')     // add time stamp to every line logged, console.log(), etc.

const { date2str } = require("./date2str")

let saveStdOut = null
let saveStdErr = null
let logger = null

// ----------------------------------------------------------------------------------------------------
function logShutdown() {

   if (saveStdOut != null)
      process.stdout.write = saveStdOut

   if (saveStdErr != null)
      process.stderr.write = saveStdErr

   if (logger != null) {
      logger.
   }

}

// ----------------------------------------------------------------------------------------------------
function log(logFileName) {

  if (logFileName.endsWith('.log'))
    logFileName = logFileName.slice(0, -4)

  logFileName = logFileName + '-' + date2str(new Date(),"yyyy-MM-dd") + '.log'

  logger = fs.createWriteStream(logFileName, {flags: 'a'});  // append to existing log file

   // also echos to the console

   // Method 1
  // process.stdout.pipe(logger)      this stopped working
  // process.stderr.pipe(logger)

  // Method 2
  saveStdOut = process.stdout.write
  saveStdErr = process.stderr.write

  process.stdout.write = process.stderr.write = logger.write.bind(logger)

  process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err)
  })

  console.log('========================================================');   // make restarts visible in the log file
  console.log('Log File:', logFileName)
  console.log('   ')

}

module.exports = { logShutdown, log }
