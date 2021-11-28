
const fs = require('fs');
require('log-timestamp');           // add time stamp to every line logged, console.log(), etc.

const { date2str } = require("./date2str");

function log(logFileName) {

  if (logFileName.endsWith('.log'))
    logFileName = logFileName.slice(0, -4);

  logFileName = logFileName + '-' + date2str(new Date(),"yyyy-MM-dd") + '.log'

  var logger = fs.createWriteStream(logFileName, {flags: 'a'});  // append to existing log file

   // also echos to the console

   // Method 1
  // process.stdout.pipe(logger)      this stopped working
  // process.stderr.pipe(logger)

  // Method 2
  process.stdout.write = process.stderr.write = logger.write.bind(logger);

  process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
  });

  console.log('========================================================');   // make restarts visible in the log file
  console.log('Log File:', logFileName);
  console.log('   ');

}

module.exports = log;
