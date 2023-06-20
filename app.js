const express = require('express')
const exhbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

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

app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(routes)

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})