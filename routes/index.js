const express = require('express')
const router = express.Router()

const home = require('./modules/home')
const record = require('./modules/record')
const user = require('./modules/user')

router.use('/record', record)
router.use('/users', user)
router.use('/', home)

module.exports = router