const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')

const functions = require('../../utils/functions')

let totalAmount = 0

//Read
router.get('/', (req, res) => {
  const userId = req.user._id

  Record.find({ userId })
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      const promises = functions.show(Category, records)
      return Promise.all(promises)
    })
    .then(records => {
      totalAmount = functions.sum(records)

      Category.find()
        .lean()
        .then(categories => res.render('index', { categories, records, totalAmount }))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/filter', (req, res) => {
  const categoryName = req.body.category
  const userId = req.user._id

  Category.findOne({ name: categoryName})
    .then(category => {
      if (!category) {
        res.redirect('/')
      } else {
        Record.find({ categoryId: category._id, userId })
          .lean()
          .then(records => {
            const promises = functions.show(Category, records)
            return Promise.all(promises)
          })
          .then(records => {
            totalAmount = functions.sum(records)
            Category.find()
              .lean()
              .then(categories => res.render('index', { categoryName, categories, records, totalAmount }))
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
})


module.exports = router



