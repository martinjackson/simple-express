
let express = require('express')

const makeRouter = (_argv) => {
    let router = express.Router();

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
