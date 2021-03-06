const os = require('os');


function debug(server, port, hostname) {

  if (port < 1000) {
    console.log(`Operating on Port ${port} requires privilege`);
  }

  function getIP() {
    const net = os.networkInterfaces();
    const dev = Object.keys(net);
    return net[dev[1]][0].address      // skip dev[0] ie. lo
  }


  function showListening(server, msg) {
    var addr = server.address();
    const ip = getIP();

    var desc = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log (hostname+" "+msg+" on " + ip + " " + desc);
  }


  process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
  });

  server.on("error", (error) => {
    // console.log('server.on("error") ', error);

    if (error.syscall !== "listen") {
      throw error;
    }

    var desc = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(desc + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(desc + " is already in use");
        process.exit(1);
        break;
      default:
        console.log('???', error);
        throw error;
    }
  });

  console.log('--------------------------------------------------------------------------------');
  server.on("listening", () => {showListening(server, "Listening")} );
  server.on("ready",     () => {showListening(server, "Ready")} );
}

module.exports = debug;
