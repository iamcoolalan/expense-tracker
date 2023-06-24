const express = require('express')
const exhbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const usePassport = require('./config/passport')

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const helpers = require('./utils/hbsHelper')
const routes = require('./routes/index')
require('./config/mongoose')

const app = express()
const port = process.env.PORT

app.engine('hbs', exhbs({ 
  defaultLayout: 'main', 
  extname: '.hbs',
  helpers 
}))
app.set('view engine', 'hbs')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
usePassport(app)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})
app.use(routes)

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})