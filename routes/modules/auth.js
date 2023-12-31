const express = require('express')
const router = express.Router()

const passport = require('passport')

router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}))

router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/users/login',
  successRedirect: '/'
}))

router.get('/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}))

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/users/login',
  successRedirect: '/'
}))

router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}))

router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/users/login',
  successRedirect: '/'
}))

module.exports = router
