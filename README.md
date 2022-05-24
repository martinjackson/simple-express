## How to Use:

### server.js
-----------------------------
```js
/* eslint-disable object-shorthand */
/* eslint-disable no-multi-spaces */
/* eslint-disable indent */

const path = require('path')
const appServer = require('@martinjackson/simple-express');
const apiRoutes = require('./apiRoutes.js');

const envPath = path.resolve(__dirname, '../.env')
appServer.serve(apiRoutes, envPath)

// run with --help for all thhe options
// use ./start.sh or ./test.sh to start (easier to stop later)
```

### apiRoutes.js
-----------------------------
```js

let fs = require('fs');
let express = require('express');

const sendmail = require('sendmail')();

// const { graphqlHTTP } = require('express-graphql');
// const schema = require('./schema.js');

const makeRouter = (argv) => {
    let router = express.Router();

   // router.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true, }));

    router.get('/api/example/:n', function (req, res) {
        console.log(`GET: /api/example/ ${req.params.n}`);

        try {
          const example = { "name": 'Bob', "Address": '1 Infinite Loop Cupertino, CA 95014' }
          res.json(example)
        } catch (err) {
          res.status(500).send("Error:"+err);
          console.error(err)
        }
      })

    return router
}

module.exports = makeRouter;
```

## Runtime switches:

1.  --port number or -p number

    The port number that the application is listening.  The default is the value in process.env.API_PORT.



2.  --http

    This will run the http protocol.  The default is https protocol.



3.  --nolog or -n

    This will not generate and send the output to the log file.  The default is to generate a log file.



4.  --logfile filename.log or -l filename.log

    This will generate a log file under the name of filename-yyyy-mm-dd.log.  The default is logs/server.log.



5.  --public or -p dirname

    The directory that is the location of the public directory.
    
6.  --fqdn {fully qualified server name}

    Pass in the *desired* fully qualified server name.  The default is to use the username --fqdn to ask the OS for the FQDN.
