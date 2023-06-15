const express = require('express')
const exhbs = require('express-handlebars')

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const routes = require('./routes/index')
require('./config/mongoose')

const app = express()
const port = process.env.PORT

app.engine('hbs', exhbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(routes)

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})