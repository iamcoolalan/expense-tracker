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

router.get('/edit/:id', (req, res) => {
  const _id = req.params.id

  Record.findOne({ _id })
    .then(record => {
      Category.findById(record.categoryId)
        .then(category => {
          const { name, amount } = record
          const date = record.date.toISOString().slice(0, 10)

          res.render('edit', { 
            name, 
            date, 
            category: category.name, 
            amount 
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

module.exports = router



