const express = require('express')
const router = express.Router()

const home = require('./modules/home')
const record = require('./modules/record')

router.use('/record', record)
router.use('/', home)

module.exports = router