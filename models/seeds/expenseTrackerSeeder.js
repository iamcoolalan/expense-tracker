const db = require('../../config/mongoose')
const { Promise } = require('mongoose')

const Category = require('../category')
const Record = require('../record')
const User = require('../user')

const SEED_CATEGORIES = require('../../data/seedCategory.json')
const category = require('../category')

db.once('open', () => {
  console.log('Generate seed data...')

  Category.create(SEED_CATEGORIES)
    .then(() => {
      console.log('done')
      process.exit()
    })
    .catch(err => console.log(err)) 
  
})