const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')

const functions = require('../../utils/functions')

let totalAmount = 0

//Read
router.get('/', (req, res) => {
  Record.find()
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      const promises = functions.show(Category, records)
      return Promise.all(promises)
    })
    .then(records => {
      totalAmount = functions.sum(records)
      res.render('index', { records, totalAmount })
    })
    .catch(err => console.log(err))
})

router.post('/sort', (req, res) => {
  const categoryName = req.body.category

  Category.findOne({ name: categoryName })
    .then(category => {
      if(!category){
        res.redirect('/')
      }else{
        Record.find({ categoryId: category._id })
          .lean()
          .then(records => {
            const promises = functions.show(Category, records)
            return Promise.all(promises)
          })
          .then(records => {
            totalAmount = functions.sum(records)
            res.render('index', { records, totalAmount, categoryName })
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
})

module.exports = router



