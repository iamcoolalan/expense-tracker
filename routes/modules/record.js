const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')


//Create
router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .then(categories => res.render('new', { categories }))
    .catch(err => console.log(err))
})

router.post('/new', (req, res) => {
  const newRecord = req.body
  const category = req.body.category
  const userId = req.user._id

  Category.findOne({ name: category })
    .then(category => {
      Record.create({
        ...newRecord,
        userId,
        categoryId: category._id
      })
        .then(() => res.redirect('/'))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))

})

//Edit
router.get('/:id/edit', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  Record.findOne({ _id, userId })
    .then(record => {
      if (!record) {
        console.log(`Can't find any result that matches this ID`)
      }else{
        Category.findById(record.categoryId)
          .then(category => {
            const { _id, name, amount } = record
            const date = record.date.toISOString().slice(0, 10)

            Category.find()
              .lean()
              .then(categories => res.render('edit', { 
                categories,
                category: category.name,
                _id,
                name,
                date,
                amount
               }))
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
})

router.put('/:id/edit', (req, res) => {
  const _id = req.params.id
  const updateRecord = req.body
  const userId = req.user._id

  Record.findOne({ _id, userId })
    .then(record => {
      if (!record) {
        console.log(`Can't find any result that matches this ID`)
      }else{
        Category.findOne({ name: updateRecord.category })
          .then(category => {
            if(!category){
              console.log(`Can't find this category`)
            }else{
              updateRecord.categoryId = category._id
              Object.assign(record, updateRecord)
    
              return record.save()
            }
          })
          .then(completedUpdate => {
            if(completedUpdate){
              return res.redirect('/')
            }else{
              const redirectUrl = `/record/${record._id}/edit`
              return res.redirect(redirectUrl)
            }
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
})

//Delete
router.delete('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  Record.findOne({ _id, userId })
    .then(record => {
      if(!record){
        console.log(`Can't find any result that matches this ID`)
      }else{
        //因為使用mongoose v7.3.0，沒有remove方法了，取而代之的就是deleteOne()
        record.deleteOne()
      }
    })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

module.exports = router



