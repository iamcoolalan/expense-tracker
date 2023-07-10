const passport = require('passport')
const bcrypt = require('bcryptjs')

const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

const User = require('../models/user')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    (req, email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            return done(null, false, req.flash('login_warning_msg', '此Email還未註冊'))
          }
          return bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {
                return done(null, false, req.flash('login_warning_msg', 'Email或密碼錯誤!'))
              }
              return done(null, user)
            })
        })
        .catch(err => done(err, false))
    }
  ));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
    const { name, email } = profile._json

    User.findOne({ email })
      .then(user => {
        if (user) {
          return done(null, user)
        }

        const randomPassword = Math.random().toString(36).slice(-8)

        bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => {
            return User.create({
              name,
              email,
              password: hash
            })
          })
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })
      .catch(err => done(err, false))

  }))

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
    passReqToCallback: true
  },
    (request, accessToken, refreshToken, profile, done) => {
      const { name, email } = profile._json

      User.findOne({ email })
        .then(user => {
          if (user) {
            return done(null, user)
          }

          const randomPassword = Math.random().toString(36).slice(-8)

          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash => {
              return User.create({
                name,
                email,
                password: hash
              })
            })
            .then(user => done(null, user))
            .catch(err => done(err, false))
        })
        .catch(err => done(err, false))
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  });
}