
// https://stackoverflow.com/a/14032965/2634223
// Thank you    Luis Gonzalez    https://stackoverflow.com/users/6673573/luis-gonzalez
// Thank you    Emil Condrea     https://stackoverflow.com/users/832363/emil-condrea

let exitAlreadyBeenHere = false

function shutdownSetup() {

    process.stdin.resume()   //so the program will not close instantly

    function exitHandler(options, exitCode) {

        if (exitAlreadyBeenHere)
           return

        if (options.cleanup) {
          console.log('clean')
        }

        if (exitCode || exitCode === 0) {
          console.log('exitCode:', exitCode)
        }

        if (options.exit) {
          exitAlreadyBeenHere = true
          process.exit()
        }
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}))

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}))

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, {exit:true}))
    process.on('SIGUSR2', exitHandler.bind(null, {exit:true}))

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit:true}))

}

module.exports = { shutdownSetup }
