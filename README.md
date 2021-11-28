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