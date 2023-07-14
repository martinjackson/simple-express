/* eslint-disable indent */

// const { serve } = require('@martinjackson/simple-express')
const { serve } = require('../appServer.js')
const apiRoutes = require('./apiRoutes.js')

serve(apiRoutes, './.env')
