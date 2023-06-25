const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const User = require('../models/user')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true }, 
    (req, email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if(!user){
            return done(null, false, req.flash('login_warning_msg', '此Email還未註冊'))
          }
          return bcrypt.compare(password, user.password)
            .then(isMatch => {
              if(!isMatch){
                return done(null, false, req.flash('login_warning_msg', 'Email或密碼錯誤!'))
              }
              return done(null, user)
            })
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