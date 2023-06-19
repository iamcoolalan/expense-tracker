const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')

router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/new',(req, res) => {
  const newRecord = req.body
  const category = req.body.category

  Category.findOne({ name: category })
    .then(category => {
      Record.create({
        ...newRecord,
        categoryId : category._id
      })
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))

})

module.exports = router