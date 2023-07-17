const passport = require('passport')
const bcrypt = require('bcryptjs')

const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github').Strategy

const User = require('../models/user')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email })

        if (!user) {
          return done(null, false, req.flash('login_warning_msg', '此Email還未註冊'))
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
          return done(null, false, req.flash('login_warning_msg', 'Email或密碼錯誤!'))
        }
        return done(null, user)

      } catch (err) {
        done(err, false)
      }
    }
  ));

  //Facebook
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, async (accessToken, refreshToken, profile, done) => {
    const { name, email } = profile._json

    try {
      const user = await User.findOne({ email })

      if (user) {
        return done(null, user)
      }

      const randomPassword = Math.random().toString(36).slice(-8)
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(randomPassword, salt)
      const newUser = await User.create({
        name,
        email,
        password: hash
      })

      return done(null, newUser)
    } catch (err) {
      done(err, false)
    }
  }))

  //Google
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
    passReqToCallback: true
  },
    async (request, accessToken, refreshToken, profile, done) => {
      const { name, email } = profile._json

      try {
        const user = await User.findOne({ email })

        if (user) {
          return done(null, user)
        }

        const randomPassword = Math.random().toString(36).slice(-8)
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(randomPassword, salt)
        const newUser = await User.create({
          name,
          email,
          password: hash
        })

        return done(null, newUser)
      } catch (err) {
        done(err, false)
      }
    }
  ));

  //Github
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK,
  },
    async (accessToken, refreshToken, profile, done) => {
      const name = profile._json.name
      const email = profile._json.email || profile.profileUrl

      try {
        const user = await User.findOne({ email })

        if (user) {
          return done(null, user)
        }

        const randomPassword = Math.random().toString(36).slice(-8)
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(randomPassword, salt)
        const newUser = await User.create({
          name,
          email,
          password: hash
        })

        return done(null, newUser)
      } catch (err) {
        done(err, false)
      }
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id).lean()
      done(null, user)
    } catch (err) {
      done(err, null)
    }
  });
}