const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')

router.get('/login', (req, res) => {
  res.status(200).render('login')
})

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('login_warning_msg', '請輸入Email以及密碼');
    return res.status(401).redirect('/users/login');
  }

  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/users/login',
    successRedirect: '/'
  })(req, res, next);
  
})

router.get('/register', (req, res) => {
  res.status(200).render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []

  if(!name || !email || !password || !confirmPassword){
    errors.push({ message: '所有欄位皆為必填' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不相符' })
  }

  if(errors.length){
    return res.status(400).render('register',{
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }else{
    User.findOne({ email })
      .then(user => {
        if (user) {
          errors.push({ message: '此Email已經註冊' })
          
          return res.status(409).render('register', {
            errors,
            name,
            email,
            password,
            confirmPassword
          })
        } else {
          bcrypt.genSalt(10)
            .then(salt => bcrypt.hash(password, salt))
            .then(hash => {
              return User.create({
                name,
                email,
                password: hash
              })
            })
            .then(() => res.status(201).redirect('/'))
            .catch(err => console.log(err))
        }
      })
      .catch(err => console.log(err))
  }
})

router.get('/logout',(req, res) => {
  req.logout()
  req.flash('success_msg', '你已成功登出!')
  res.redirect('/users/login')
})

module.exports = router