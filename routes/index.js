const express = require('express')
const router = express.Router()

const home = require('./modules/home')
const record = require('./modules/record')
const user = require('./modules/user')
const auth = require('./modules/auth')

const { authenticator } = require('../middleware/auth')

router.use('/record', authenticator, record)
router.use('/users', user)
router.use('/auth', auth)
router.use('/', authenticator, home)

module.exports = router