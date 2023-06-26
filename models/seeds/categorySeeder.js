const db = require('../../config/mongoose')

const Category = require('../category')

const SEED_CATEGORIES = require('../../data/seedCategory.json')


db.once('open', () => {
  console.log('Start generating category seed data...')

  Category.create(SEED_CATEGORIES)
    .then(() => {
      console.log('Complete generating category seed data ')
      process.exit()
    })
    .catch(err => console.log(err)) 
  
})